package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID               uuid.UUID `json:"id"`
	Email            string    `json:"email"`
	Phone            string    `json:"phone"`
	PasswordHash     string    `json:"-"`
	FullName         string    `json:"full_name"`
	Role             string    `json:"role"`
	IsEmailVerified  bool      `json:"is_email_verified"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Event struct {
	ID             uuid.UUID  `json:"id"`
	OrganizerID    uuid.UUID  `json:"organizer_id"`
	Title          string     `json:"title"`
	Slug           string     `json:"slug"`
	Description    *string    `json:"description"`
	VenueName      string     `json:"venue_name"`
	VenueAddress   *string    `json:"venue_address"`
	City           string     `json:"city"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	StartTime      string     `json:"start_time"`
	EndTime        *string    `json:"end_time"`
	CoverImageURL  *string    `json:"cover_image_url"`
	Status         string     `json:"status"`
	SalesStartDate *time.Time `json:"sales_start_date"`
	SalesEndDate   *time.Time `json:"sales_end_date"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type TicketType struct {
	ID               uuid.UUID `json:"id"`
	EventID          uuid.UUID `json:"event_id"`
	Name             string    `json:"name"`
	Description      *string   `json:"description"`
	Price            int       `json:"price"`
	QuantityAvailable int      `json:"quantity_available"`
	QuantitySold     int       `json:"quantity_sold"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Order struct {
	ID                   uuid.UUID  `json:"id"`
	EventID              uuid.UUID  `json:"event_id"`
	TicketTypeID         uuid.UUID  `json:"ticket_type_id"`
	AttendeeName         string     `json:"attendee_name"`
	AttendeePhone        string     `json:"attendee_phone"`
	AttendeeEmail        *string    `json:"attendee_email"`
	Quantity             int        `json:"quantity"`
	UnitPrice            int        `json:"unit_price"`
	TotalAmount          int        `json:"total_amount"`
	PaymentStatus        string     `json:"payment_status"`
	PaymentMethod        string     `json:"payment_method"`
	TransactionID        *string    `json:"transaction_id"`
	PaymentReceivedAt    *time.Time `json:"payment_received_at"`
	QRCodeHash           string     `json:"qr_code_hash"`
	QRCodeImageURL       *string    `json:"qr_code_image_url"`
	IsUsed               bool       `json:"is_used"`
	UsedAt               *time.Time `json:"used_at"`
	CheckedInBy          *uuid.UUID `json:"checked_in_by"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}