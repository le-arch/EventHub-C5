// Package payment handles processing incoming CamPay webhook notifications.
package payment

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
)

// CamPayWebhookPayload represents the structural notification data sent by CamPay
type CamPayWebhookPayload struct {
	Reference string  `json:"reference"` // Unique CamPay transaction reference (maps to database transaction_id)
	Status    string  `json:"status"`    // FAILED or SUCCESSFUL
	Amount    float64 `json:"amount"`    // Total checkout value processing currency
	Currency  string  `json:"currency"`  // e.g., XAF
	Operator  string  `json:"operator"`  // e.g., MTN, ORANGE
	Phone     string  `json:"phone"`     // Payer destination identification number
	Reason    string  `json:"reason"`    // Custom billing metadata parameters
}

type WebhookHandler struct {
	querier repo.Querier
	secret  string // Secure API Webhook Token provided by CamPay Dashboard
}

func NewWebhookHandler(querier repo.Querier, secret string) *WebhookHandler {
	return &WebhookHandler{querier: querier, secret: secret}
}

// verifySignature validates the authorization string sent by CamPay to protect your engine endpoints
func (wh *WebhookHandler) verifySignature(authHeader string) bool {
	if authHeader == "" || wh.secret == "" {
		return false
	}
	// Secure constant-time comparison against your webhook validation token string
	return subtle.ConstantTimeCompare([]byte(authHeader), []byte("Token "+wh.secret)) == 1
}

// HandleCamPayWebhook parses, validates, and processes transactional state changes from CamPay
func (wh *WebhookHandler) HandleCamPayWebhook(c *gin.Context) {
	// Look up authorization vector properties
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		authHeader = c.GetHeader("X-CamPay-Signature") // Fallback mapping configuration
	}

	body, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to extract incoming payload stream"})
		return
	}

	// Validate authorization signature security block
	signatureValid := wh.verifySignature(authHeader)
	if !signatureValid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid access credentials"})
		return
	}

	var payload CamPayWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "malformed data structural mapping"})
		return
	}

	headersBytes, _ := json.Marshal(c.Request.Header)
	var errMsg string
	isProcessed := false

	if payload.Reference == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing tracking reference token"})
		return
	}

	refString := payload.Reference
	order, err := wh.querier.GetOrderByTransactionID(c, &refString)
	if err != nil {
		errMsg = "order reference correlation mismatch: " + err.Error()
		wh.logWebhook(c, refString, body, headersBytes, signatureValid, &isProcessed, errMsg)
		c.JSON(http.StatusNotFound, gin.H{"error": "no matching open order records found"})
		return
	}

	// order.ID is available as order.ID if needed

	var newStatus string
	switch payload.Status {
	case "SUCCESSFUL":
		newStatus = string(repo.PaymentStatusPaid)
		// Decrement physical ticket inventory pools matching structural allocations
		rows, err := wh.querier.DecrementTicketQuantity(c, repo.DecrementTicketQuantityParams{
			ID:                order.TicketTypeID,
			QuantityAvailable: order.Quantity,
		})
		if err != nil || rows == 0 {
			newStatus = string(repo.PaymentStatusFailed)
			errMsg = "inventory allocation block failed: exhausted capacity limits"
		}
	case "FAILED":
		newStatus = string(repo.PaymentStatusFailed)
	default:
		newStatus = string(repo.PaymentStatusFailed)
	}

	// Update systemic order statuses
	// UpdateOrderPayment expects pointer types for status and transaction id
	paymentStatusPtr := &newStatus
	txPtr := &refString
	updatedOrder, err := wh.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: paymentStatusPtr,
		TransactionID: txPtr,
	})

	if err != nil {
		errMsg = "systemic repository mapping exception layer: " + err.Error()
		wh.logWebhook(c, refString, body, headersBytes, signatureValid, &isProcessed, errMsg)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed state database persistence sequence execution"})
		return
	}

	if updatedOrder.PaymentWebhookReceived != nil {
		isProcessed = *updatedOrder.PaymentWebhookReceived
	}
	wh.logWebhook(c, refString, body, headersBytes, signatureValid, &isProcessed, errMsg)

	c.JSON(http.StatusOK, gin.H{"status": "processed", "payment_status": newStatus})
}

// logWebhook records raw transactional logs down into payment_webhook_logs for administrative audit tracking
func (wh *WebhookHandler) logWebhook(c *gin.Context, txID string, payload, headers []byte, sigValid bool, processed *bool, errMsg string) {
	provider := "campay"
	// InsertWebhookLogParams expects Provider *string, Payload []byte, Headers []byte, SignatureValid *bool, Processed *bool, ErrorMessage string
	_, _ = wh.querier.InsertWebhookLog(c, repo.InsertWebhookLogParams{
		Provider:       &provider,
		Payload:        payload,
		Headers:        headers,
		SignatureValid: &sigValid,
		Processed:      processed,
		ErrorMessage:   errMsg,
	})
}
