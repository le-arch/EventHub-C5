package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/le-arch/EventHub-C5/internal/models"
)

// PaymentService handles payment operations
type PaymentService struct {
	db *pgxpool.Pool
}

// NewPaymentService creates a new payment service
func NewPaymentService(db *pgxpool.Pool) *PaymentService {
	return &PaymentService{db: db}
}

// RecordWebhook records a payment webhook
func (s *PaymentService) RecordWebhook(ctx context.Context, log *models.PaymentWebhookLog) error {
	if log.ID == uuid.Nil {
		log.ID = uuid.New()
	}

	query := `
		INSERT INTO payment_webhook_logs (
			id, transaction_id, order_id, provider, payload, headers,
			signature_valid, processed, received_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := s.db.Exec(ctx, query,
		log.ID,
		log.TransactionID,
		log.OrderID,
		log.Provider,
		log.Payload,
		log.Headers,
		log.SignatureValid,
		log.Processed,
		log.ReceivedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to record webhook: %w", err)
	}

	return nil
}

// GetWebhookLog retrieves a webhook log by ID
func (s *PaymentService) GetWebhookLog(ctx context.Context, logID uuid.UUID) (*models.PaymentWebhookLog, error) {
	query := `
		SELECT 
			id, transaction_id, order_id, provider, payload, headers,
			signature_valid, processed, processed_at, error_message, received_at
		FROM payment_webhook_logs
		WHERE id = $1
	`

	log := &models.PaymentWebhookLog{}
	err := s.db.QueryRow(ctx, query, logID).Scan(
		&log.ID,
		&log.TransactionID,
		&log.OrderID,
		&log.Provider,
		&log.Payload,
		&log.Headers,
		&log.SignatureValid,
		&log.Processed,
		&log.ProcessedAt,
		&log.ErrorMessage,
		&log.ReceivedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("webhook log not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get webhook log: %w", err)
	}

	return log, nil
}

// GetWebhookByTransactionID retrieves a webhook log by transaction ID
func (s *PaymentService) GetWebhookByTransactionID(ctx context.Context, transactionID string) (*models.PaymentWebhookLog, error) {
	query := `
		SELECT 
			id, transaction_id, order_id, provider, payload, headers,
			signature_valid, processed, processed_at, error_message, received_at
		FROM payment_webhook_logs
		WHERE transaction_id = $1
		ORDER BY received_at DESC
		LIMIT 1
	`

	log := &models.PaymentWebhookLog{}
	err := s.db.QueryRow(ctx, query, transactionID).Scan(
		&log.ID,
		&log.TransactionID,
		&log.OrderID,
		&log.Provider,
		&log.Payload,
		&log.Headers,
		&log.SignatureValid,
		&log.Processed,
		&log.ProcessedAt,
		&log.ErrorMessage,
		&log.ReceivedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("webhook log not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get webhook log: %w", err)
	}

	return log, nil
}

// MarkWebhookProcessed marks a webhook as processed
func (s *PaymentService) MarkWebhookProcessed(ctx context.Context, logID uuid.UUID, errorMsg *string) error {
	query := `
		UPDATE payment_webhook_logs
		SET processed = true, processed_at = NOW(), error_message = $2
		WHERE id = $1
	`

	_, err := s.db.Exec(ctx, query, logID, errorMsg)
	if err != nil {
		return fmt.Errorf("failed to mark webhook as processed: %w", err)
	}

	return nil
}

// GetUnprocessedWebhooks retrieves unprocessed webhooks
func (s *PaymentService) GetUnprocessedWebhooks(ctx context.Context, limit int) ([]models.PaymentWebhookLog, error) {
	query := `
		SELECT 
			id, transaction_id, order_id, provider, payload, headers,
			signature_valid, processed, processed_at, error_message, received_at
		FROM payment_webhook_logs
		WHERE processed = false
		ORDER BY received_at ASC
		LIMIT $1
	`

	rows, err := s.db.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get unprocessed webhooks: %w", err)
	}
	defer rows.Close()

	var logs []models.PaymentWebhookLog
	for rows.Next() {
		log := models.PaymentWebhookLog{}
		err := rows.Scan(
			&log.ID,
			&log.TransactionID,
			&log.OrderID,
			&log.Provider,
			&log.Payload,
			&log.Headers,
			&log.SignatureValid,
			&log.Processed,
			&log.ProcessedAt,
			&log.ErrorMessage,
			&log.ReceivedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan webhook log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, rows.Err()
}

// VerifyPaymentSignature verifies a payment provider signature (stub)
func (s *PaymentService) VerifyPaymentSignature(provider string, payload []byte, signature string) bool {
	// Implementation depends on payment provider
	// This is a stub - implement actual signature verification
	return true
}

// ProcessCamPayWebhook processes a CamPay webhook
func (s *PaymentService) ProcessCamPayWebhook(ctx context.Context, payload map[string]interface{}) error {
	transactionID, ok := payload["transaction_id"].(string)
	if !ok {
		return errors.New("missing transaction_id in webhook")
	}

	status, ok := payload["status"].(string)
	if !ok {
		return errors.New("missing status in webhook")
	}

	// Get the order
	orderService := NewOrderService(s.db)
	order, err := orderService.GetOrderByTransactionID(ctx, transactionID)
	if err != nil {
		return fmt.Errorf("order not found: %w", err)
	}

	// Update order based on payment status
	if status == "completed" || status == "success" {
		order.PaymentStatus = "paid"
		order.PaymentReceivedAt = &[]time.Time{time.Now()}[0]
	} else if status == "failed" {
		order.PaymentStatus = "failed"
	} else if status == "cancelled" {
		order.PaymentStatus = "cancelled"
	}

	// Update the order
	if err := orderService.UpdateOrder(ctx, order); err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	return nil
}

// GetPaymentStats retrieves payment statistics
func (s *PaymentService) GetPaymentStats(ctx context.Context, eventID uuid.UUID) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_orders,
			COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
			COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders,
			COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_orders,
			COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
		FROM orders
		WHERE event_id = $1
	`

	stats := map[string]interface{}{}
	var totalOrders, paidOrders, pendingOrders, failedOrders, totalRevenue interface{}

	err := s.db.QueryRow(ctx, query, eventID).Scan(
		&totalOrders,
		&paidOrders,
		&pendingOrders,
		&failedOrders,
		&totalRevenue,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get payment stats: %w", err)
	}

	stats["total_orders"] = totalOrders
	stats["paid_orders"] = paidOrders
	stats["pending_orders"] = pendingOrders
	stats["failed_orders"] = failedOrders
	stats["total_revenue"] = totalRevenue

	return stats, nil
}

// CamPayWebhookPayload represents a CamPay webhook payload
type CamPayWebhookPayload struct {
	TransactionID string `json:"transaction_id"`
	Amount        int    `json:"amount"`
	Currency      string `json:"currency"`
	Status        string `json:"status"`
	Reference     string `json:"reference"`
	Timestamp     string `json:"timestamp"`
}

// ParseCamPayWebhook parses a CamPay webhook
func (s *PaymentService) ParseCamPayWebhook(body []byte) (*CamPayWebhookPayload, error) {
	var payload CamPayWebhookPayload
	err := json.Unmarshal(body, &payload)
	if err != nil {
		return nil, fmt.Errorf("failed to parse webhook: %w", err)
	}
	return &payload, nil
}
