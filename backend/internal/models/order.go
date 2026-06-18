package models

import "github.com/google/uuid"

type PaymentStatus string

const (
    PaymentStatusPending   = "pending"
    PaymentStatusPaid      = "paid"
    PaymentStatusFailed    = "failed"
    PaymentStatusCancelled = "cancelled"
    PaymentStatusRefunded  = "refunded"
)


type CreateOrderRequest struct {
    EventID       uuid.UUID `json:"event_id" binding:"required"`
    TicketTypeID  uuid.UUID `json:"ticket_type_id" binding:"required"`
    AttendeeName  string    `json:"attendee_name" binding:"required"`
    AttendeePhone string    `json:"attendee_phone" binding:"required"`
    AttendeeEmail string    `json:"attendee_email"`
    Quantity      int32     `json:"quantity" binding:"required,min=1"` 
}

type MomoWebhookPayload struct {
	TransactionID string `json:"transactionId"`
	Status        string `json:"status"` 
	ExternalID    string `json:"externalId"`
}

type PaymentRequest struct {
	Amount       float64 `json:"amount"`
	Currency     string  `json:"currency"`
	ExternalID   string  `json:"externalId"`
	Payer        string  `json:"payer"`
	PayerMessage string  `json:"payerMessage"`
	PayeeNote    string  `json:"payeeNote"`
}

type Payer struct {
	PartyIDType string `json:"partyIdType"`
	PartyID     string `json:"partyId"`
}