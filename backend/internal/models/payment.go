package models

import (
	"time"

	"github.com/google/uuid"
)

// CamPayPaymentRequest represents the outgoing payload sent to CamPay's collection API
type CamPayPaymentRequest struct {
	Amount       float64 `json:"amount" binding:"required,gt=0"`
	Currency     string  `json:"currency" binding:"required"` // e.g., "XAF"
	ExternalID   string  `json:"external_id" binding:"required"` // Your internal Order ID
	Payer        string  `json:"payer" binding:"required"`       // Payer phone number (with or without country code depending on configuration)
	PayerMessage string  `json:"payer_message,omitempty"`        // Message displayed on the prompt
}

// CamPayPaymentResponse represents the immediate response back from CamPay after hitting their collection endpoint
type CamPayPaymentResponse struct {
	Reference string `json:"reference"` // CamPay tracking identifier code
	Status    string `json:"status"`    // PENDING, SUCCESSFUL, or FAILED
	Operator  string `json:"operator"`  // MTN, ORANGE, etc.
}

// CamPayWebhookPayload represents the structure of the automated server-to-server callback notification data sent by CamPay
type CamPayWebhookPayload struct {
	Reference string  `json:"reference"` // Maps directly to transaction_id
	Status    string  `json:"status"`    // SUCCESSFUL or FAILED
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"` // e.g., "XAF"
	Operator  string  `json:"operator"` // e.g., "MTN", "ORANGE"
	Phone     string  `json:"phone"`    // Payer destination phone identifier
	Reason    string  `json:"reason"`   // Custom tracking metadata string context
}

// PaymentStatusLog helper is used for exposing internal audit history views on admin tools
type PaymentStatusLog struct {
	ID             uuid.UUID `json:"id"`
	OrderID        uuid.UUID `json:"order_id"`
	TransactionID  string    `json:"transaction_id"`
	Provider       string    `json:"provider"` // hardcoded to "campay"
	SignatureValid bool      `json:"signature_valid"`
	Processed      bool      `json:"processed"`
	ErrorMessage   string    `json:"error_message,omitempty"`
	ReceivedAt     time.Time `json:"received_at"`
}