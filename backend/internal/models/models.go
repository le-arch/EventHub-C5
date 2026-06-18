package models

import (
	"time"
	"github.com/google/uuid"
)

// User represents an organizer or admin account
type User struct {
	ID              uuid.UUID `json:"id"`
	Email           string    `json:"email"`
	Phone           string    `json:"phone"`
	FullName        string    `json:"full_name"`
	Role            string    `json:"role"`                     // "organizer" or "admin"
	IsEmailVerified bool      `json:"is_email_verified"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Event represents an event created by an organizer
type Event struct {
	ID             uuid.UUID  `json:"id"`
	OrganizerID    uuid.UUID  `json:"organizer_id"`
	Title          string     `json:"title"`
	Slug           string     `json:"slug"`
	Description    *string    `json:"description,omitempty"`
	VenueName      string     `json:"venue_name"`
	VenueAddress   *string    `json:"venue_address,omitempty"`
	City           string     `json:"city"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date,omitempty"`
	StartTime      string     `json:"start_time"`   // stored as TIME string
	EndTime        *string    `json:"end_time,omitempty"`
	CoverImageURL  *string    `json:"cover_image_url,omitempty"`
	Status         string     `json:"status"`       // draft, published, cancelled, completed
	SalesStartDate *time.Time `json:"sales_start_date,omitempty"`
	SalesEndDate   *time.Time `json:"sales_end_date,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// TicketType represents a ticket category for an event
type TicketType struct {
	ID                uuid.UUID  `json:"id"`
	EventID           uuid.UUID  `json:"event_id"`
	Name              string     `json:"name"`
	Description       *string    `json:"description,omitempty"`
	Price             int        `json:"price"`                // in XAF
	QuantityAvailable int        `json:"quantity_available"`
	QuantitySold      int        `json:"quantity_sold"`
	IsActive          bool       `json:"is_active"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// Order represents a ticket purchase (order)
type Order struct {
	ID                uuid.UUID  `json:"id"`
	EventID           uuid.UUID  `json:"event_id"`
	TicketTypeID      uuid.UUID  `json:"ticket_type_id"`
	AttendeeName      string     `json:"attendee_name"`
	AttendeePhone     string     `json:"attendee_phone"`
	AttendeeEmail     *string    `json:"attendee_email,omitempty"`
	Quantity          int        `json:"quantity"`
	UnitPrice         int        `json:"unit_price"`
	TotalAmount       int        `json:"total_amount"`
	PaymentStatus     string     `json:"payment_status"`       // pending, paid, failed, refunded
	PaymentMethod     string     `json:"payment_method"`       // campay, mtn_momo, orange_money
	TransactionID     *string    `json:"transaction_id,omitempty"`
	PaymentReceivedAt *time.Time `json:"payment_received_at,omitempty"`
	QRCodeHash        string     `json:"qr_code_hash"`
	QRCodeImageURL    *string    `json:"qr_code_image_url,omitempty"`
	IsUsed            bool       `json:"is_used"`
	UsedAt            *time.Time `json:"used_at,omitempty"`
	CheckedInBy       *uuid.UUID `json:"checked_in_by,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// CheckInLog records each QR code scan at the event entrance
type CheckInLog struct {
	ID           uuid.UUID `json:"id"`
	OrderID      uuid.UUID `json:"order_id"`
	AttendeeName string    `json:"attendee_name"`
	EventID      uuid.UUID `json:"event_id"`
	ScannedBy    uuid.UUID `json:"scanned_by"`
	ScannedAt    time.Time `json:"scanned_at"`
	IPAddress    *string   `json:"ip_address,omitempty"`
	UserAgent    *string   `json:"user_agent,omitempty"`
}

// PaymentWebhookLog stores incoming webhook payloads from CamPay
type PaymentWebhookLog struct {
	ID             uuid.UUID  `json:"id"`
	TransactionID  string     `json:"transaction_id"`
	OrderID        *uuid.UUID `json:"order_id,omitempty"`
	Provider       string     `json:"provider"` // "campay"
	Payload        string     `json:"payload"`  // JSON string
	Headers        string     `json:"headers"`
	SignatureValid bool       `json:"signature_valid"`
	Processed      bool       `json:"processed"`
	ProcessedAt    *time.Time `json:"processed_at,omitempty"`
	ErrorMessage   *string    `json:"error_message,omitempty"`
	ReceivedAt     time.Time  `json:"received_at"`
}

// AdminLog tracks actions performed by administrators
type AdminLog struct {
	ID         uuid.UUID  `json:"id"`
	AdminID    uuid.UUID  `json:"admin_id"`
	Action     string     `json:"action"`
	TargetType string     `json:"target_type"` // "user", "event", "order"
	TargetID   *uuid.UUID `json:"target_id,omitempty"`
	OldValues  *string    `json:"old_values,omitempty"` // JSON string
	NewValues  *string    `json:"new_values,omitempty"` // JSON string
	Details    *string    `json:"details,omitempty"`
	IPAddress  *string    `json:"ip_address,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

// SystemConfig stores key-value configuration
type SystemConfig struct {
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description *string   `json:"description,omitempty"`
	UpdatedAt   time.Time `json:"updated_at"`
}