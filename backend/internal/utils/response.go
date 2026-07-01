// utility functions for standardizing API responses and error handling
package utils

import (
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
)

// RegisterResponse defines the structure of the response sent back to the client after a successful registration
type RegisterResponse struct {
	ID uuid.UUID `json:"id"`
	FullName string `json:"full_name"`
	Email string `json:"email"`
	Role repo.UserRole `json:"role"`
	IsEmailVerified *bool  `json:"is_email_verified"`
	CreatedAt  string `json:"created_at"`
}

type LoginResponse struct {
	Token string `json:"token"`
	RefreshToken string `json:"refresh_token"`
	User RegisterResponse `json:"user"`
}

type CreateEventResponse struct {
	ID             uuid.UUID        `json:"id"`
	OrganizerID    uuid.UUID        `json:"organizer_id"`
	Title          string           `json:"title"`
	Slug           string           `json:"slug"`
	Description    string           `json:"description"`
	Venue          string           `json:"venue"`
	City           string           `json:"city"`
	StartDate      string           `json:"start_date"`       
	EndDate        string           `json:"end_date"`         
	StartTime      string           `json:"start_time"`       
	EndTime        string          `json:"end_time"`         
	CoverImageUrl  string           `json:"cover_image_url"`
	Status         repo.EventStatus `json:"status"`
	SalesStartDate string           `json:"sales_start_date"` 
	SalesEndDate   string           `json:"sales_end_date"` 
	CapacityRange  *models.CapacityRangeJSON			`json:"capacity_range"`  
  
	CreatedAt      string      		`json:"created_at"`
	
	UpdatedAt      string           `json:"updated_at"`
}

type EventResponse struct{	
	ID				uuid.UUID 	`json:"id"`
	OrganizerID		uuid.UUID	`json:"organizer_id,omitempty"`
	OrganizerName 	string		`json:"organizer_name,omitempty"`

	Title          string           `json:"title"`
	Slug           string           `json:"slug"`
	Description    string           `json:"description"`
	Venue          string           `json:"venue"`
	City           string           `json:"city"`
	StartDate      string           `json:"start_date"`       
	EndDate        string           `json:"end_date"`         
	StartTime      string           `json:"start_time"`       
	EndTime        string          `json:"end_time"`         
	CoverImageUrl  string           `json:"cover_image_url"`
	Status         repo.EventStatus `json:"status"`
	SalesStartDate string           `json:"sales_start_date"` 
	SalesEndDate   string           `json:"sales_end_date"` 
	CapacityRange  *models.CapacityRangeJSON			`json:"capacity_range"`  
	UpdatedAt      string           `json:"updated_at"`
}

type CreateTicketTypeResponse struct {
    ID               uuid.UUID `json:"id"`
    EventID          uuid.UUID `json:"event_id"`
    Name             string    `json:"name"`
    Description      string    `json:"description"`
    Price            int32     `json:"price"`
    QuantityAvailable int32     `json:"quantity_available"`
    QuantitySold     int32     `json:"quantity_sold"`
    IsActive         *bool      `json:"is_active"`
	UpdatedAt        string    `json:"updated_at"`
	CreatedAt      string      		`json:"created_at"`
}

type TicketTypeResponse struct {
    ID               uuid.UUID `json:"id"`
    EventID          uuid.UUID `json:"event_id"`
    Name             string    `json:"name,omitempty"`
    Description      string    `json:"description,omitempty"`
    Price            int32     `json:"price,omitempty"`
    QuantityAvailable int32     `json:"quantity_available,omitempty"`
    QuantitySold     int32     `json:"quantity_sold,omitempty"`
    IsActive         *bool      `json:"is_active"`
	UpdatedAt        string    `json:"updated_at"`
	
}

type OrderResponse struct {
	ID              uuid.UUID `json:"id"`
	EventID         uuid.UUID `json:"event_id"`
	TicketTypeID    uuid.UUID `json:"ticket_type_id"`
	AttendeeName    string    `json:"attendee_name"`
	AttendeePhone   string    `json:"attendee_phone"`
	AttendeeEmail   *string   `json:"attendee_email,omitempty"`
	Quantity        int32     `json:"quantity"`
	UnitPrice       int32     `json:"unit_price"`
	TotalAmount     int32     `json:"total_amount"`
	PaymentStatus   string    `json:"payment_status"`
	TransactionID   *string   `json:"transaction_id,omitempty"`
	QRCodeHash      string    `json:"qr_code_hash"`
	QRCodeImageURL  string    `json:"qr_code_image_url"`
	IsUsed          *bool      `json:"is_used"`
	CreatedAt       string    `json:"created_at"`
}



type PaymentResponse struct {
	TransactionID string `json:"transactionId"`
	Status        string `json:"status"`
}
