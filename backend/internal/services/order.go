package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/qrcode"
)

// OrderService handles business logic for orders
type OrderService struct {
	db *pgxpool.Pool
}

// NewOrderService creates a new order service
func NewOrderService(db *pgxpool.Pool) *OrderService {
	return &OrderService{db: db}
}

// CreateOrder creates a new order for a ticket
func (s *OrderService) CreateOrder(ctx context.Context, order *models.Order) error {
	if order.ID == uuid.Nil {
		order.ID = uuid.New()
	}

	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now()
	}

	if order.UpdatedAt.IsZero() {
		order.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO orders (
			id, event_id, ticket_type_id, attendee_name, attendee_phone,
			attendee_email, quantity, unit_price, total_amount, 
			payment_status, payment_method, qr_code_hash, qr_code_plaintext,
			is_used, platform_fee, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
		)
	`

	err := s.db.QueryRow(ctx, query,
		order.ID,
		order.EventID,
		order.TicketTypeID,
		order.AttendeeName,
		order.AttendeePhone,
		order.AttendeeEmail,
		order.Quantity,
		order.UnitPrice,
		order.TotalAmount,
		order.PaymentStatus,
		order.PaymentMethod,
		order.QRCodeHash,
		order.QRCodePlaintext,
		order.IsUsed,
		order.PlatformFee,
		order.CreatedAt,
		order.UpdatedAt,
	).Scan()

	if err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}

	return nil
}

// GetOrder retrieves an order by ID
func (s *OrderService) GetOrder(ctx context.Context, orderID uuid.UUID) (*models.Order, error) {
	query := `
		SELECT 
			id, event_id, ticket_type_id, attendee_name, attendee_phone,
			attendee_email, quantity, unit_price, total_amount,
			payment_status, payment_method, transaction_id, payment_received_at,
			qr_code_hash, qr_code_image_url, qr_code_plaintext, is_used, used_at,
			checked_in_by, platform_fee, created_at, updated_at
		FROM orders
		WHERE id = $1
	`

	order := &models.Order{}
	err := s.db.QueryRow(ctx, query, orderID).Scan(
		&order.ID,
		&order.EventID,
		&order.TicketTypeID,
		&order.AttendeeName,
		&order.AttendeePhone,
		&order.AttendeeEmail,
		&order.Quantity,
		&order.UnitPrice,
		&order.TotalAmount,
		&order.PaymentStatus,
		&order.PaymentMethod,
		&order.TransactionID,
		&order.PaymentReceivedAt,
		&order.QRCodeHash,
		&order.QRCodeImageURL,
		&order.QRCodePlaintext,
		&order.IsUsed,
		&order.UsedAt,
		&order.CheckedInBy,
		&order.PlatformFee,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("order not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	return order, nil
}

// GetOrderByTransactionID retrieves an order by transaction ID
func (s *OrderService) GetOrderByTransactionID(ctx context.Context, transactionID string) (*models.Order, error) {
	query := `
		SELECT 
			id, event_id, ticket_type_id, attendee_name, attendee_phone,
			attendee_email, quantity, unit_price, total_amount,
			payment_status, payment_method, transaction_id, payment_received_at,
			qr_code_hash, qr_code_image_url, qr_code_plaintext, is_used, used_at,
			checked_in_by, platform_fee, created_at, updated_at
		FROM orders
		WHERE transaction_id = $1
	`

	order := &models.Order{}
	err := s.db.QueryRow(ctx, query, transactionID).Scan(
		&order.ID,
		&order.EventID,
		&order.TicketTypeID,
		&order.AttendeeName,
		&order.AttendeePhone,
		&order.AttendeeEmail,
		&order.Quantity,
		&order.UnitPrice,
		&order.TotalAmount,
		&order.PaymentStatus,
		&order.PaymentMethod,
		&order.TransactionID,
		&order.PaymentReceivedAt,
		&order.QRCodeHash,
		&order.QRCodeImageURL,
		&order.QRCodePlaintext,
		&order.IsUsed,
		&order.UsedAt,
		&order.CheckedInBy,
		&order.PlatformFee,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("order not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	return order, nil
}

// ConfirmPayment confirms payment for an order and marks it as paid
func (s *OrderService) ConfirmPayment(ctx context.Context, transactionID string) error {
	order, err := s.GetOrderByTransactionID(ctx, transactionID)
	if err != nil {
		return fmt.Errorf("order not found: %w", err)
	}

	query := `
		UPDATE orders
		SET payment_status = 'paid', payment_received_at = NOW(), payment_webhook_received = true, updated_at = NOW()
		WHERE id = $1
	`

	_, err = s.db.Exec(ctx, query, order.ID)
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	return nil
}

// CheckInOrder marks an order as used/checked in
func (s *OrderService) CheckInOrder(ctx context.Context, orderID uuid.UUID, adminID uuid.UUID) error {
	query := `
		UPDATE orders
		SET is_used = true, used_at = NOW(), checked_in_by = $2, updated_at = NOW()
		WHERE id = $1
	`

	result, err := s.db.Exec(ctx, query, orderID, adminID)
	if err != nil {
		return fmt.Errorf("failed to check in order: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("order not found")
	}

	return nil
}

// GetOrdersByEvent retrieves all orders for an event
func (s *OrderService) GetOrdersByEvent(ctx context.Context, eventID uuid.UUID, limit, offset int) ([]models.Order, error) {
	query := `
		SELECT 
			id, event_id, ticket_type_id, attendee_name, attendee_phone,
			attendee_email, quantity, unit_price, total_amount,
			payment_status, payment_method, transaction_id, payment_received_at,
			qr_code_hash, qr_code_image_url, qr_code_plaintext, is_used, used_at,
			checked_in_by, platform_fee, created_at, updated_at
		FROM orders
		WHERE event_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(ctx, query, eventID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		order := models.Order{}
		err := rows.Scan(
			&order.ID,
			&order.EventID,
			&order.TicketTypeID,
			&order.AttendeeName,
			&order.AttendeePhone,
			&order.AttendeeEmail,
			&order.Quantity,
			&order.UnitPrice,
			&order.TotalAmount,
			&order.PaymentStatus,
			&order.PaymentMethod,
			&order.TransactionID,
			&order.PaymentReceivedAt,
			&order.QRCodeHash,
			&order.QRCodeImageURL,
			&order.QRCodePlaintext,
			&order.IsUsed,
			&order.UsedAt,
			&order.CheckedInBy,
			&order.PlatformFee,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, rows.Err()
}

// UpdateOrder updates an order
func (s *OrderService) UpdateOrder(ctx context.Context, order *models.Order) error {
	order.UpdatedAt = time.Now()

	query := `
		UPDATE orders
		SET 
			attendee_name = $2,
			attendee_phone = $3,
			attendee_email = $4,
			payment_status = $5,
			payment_method = $6,
			transaction_id = $7,
			payment_received_at = $8,
			qr_code_hash = $9,
			qr_code_image_url = $10,
			is_used = $11,
			used_at = $12,
			checked_in_by = $13,
			updated_at = $14
		WHERE id = $1
	`

	result, err := s.db.Exec(ctx, query,
		order.ID,
		order.AttendeeName,
		order.AttendeePhone,
		order.AttendeeEmail,
		order.PaymentStatus,
		order.PaymentMethod,
		order.TransactionID,
		order.PaymentReceivedAt,
		order.QRCodeHash,
		order.QRCodeImageURL,
		order.IsUsed,
		order.UsedAt,
		order.CheckedInBy,
		order.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("order not found")
	}

	return nil
}

// GenerateQRCode generates a QR code for an order
func (s *OrderService) GenerateQRCode(ctx context.Context, orderID uuid.UUID) (string, error) {
	order, err := s.GetOrder(ctx, orderID)
	if err != nil {
		return "", fmt.Errorf("failed to get order: %w", err)
	}

	// Generate QR code data
	qrData := fmt.Sprintf("order:%s|event:%s|attendee:%s", 
		order.ID.String(), 
		order.EventID.String(), 
		order.AttendeeName)

	// Generate QR code image
	qrImage, err := qrcode.GenerateQRCode(ctx, qrData)
	if err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	// Update order with QR code
	query := `
		UPDATE orders
		SET qr_code_image_url = $2, qr_code_plaintext = $3, updated_at = NOW()
		WHERE id = $1
	`

	_, err = s.db.Exec(ctx, query, orderID, qrImage, qrData)
	if err != nil {
		return "", fmt.Errorf("failed to update order with QR code: %w", err)
	}

	return qrImage, nil
}
