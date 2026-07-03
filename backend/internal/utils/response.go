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
	FullName string `json:"fullName"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role repo.UserRole `json:"role"`
	IsEmailVerified bool  `json:"isEmailVerified"`
	IsActive bool `json:"isActive"`
	EventsCount int32 `json:"eventsCount"`
	CreatedAt  string `json:"createdAt"`
}

type LoginResponse struct {
	Token string `json:"token"`
	RefreshToken string `json:"refreshToken"`
	User RegisterResponse `json:"user"`
}

type TicketStatsResponse struct {
	TotalSold       int32 `json:"totalSold"`
	TotalRevenue    int32 `json:"totalRevenue"`
	TotalAttendees  int32 `json:"totalAttendees"`
	AvailableTickets int32 `json:"availableTickets"`
}

type CreateEventResponse struct {
	ID             uuid.UUID        `json:"id"`
	OrganizerID    uuid.UUID        `json:"organizerId"`
	Title          string           `json:"title"`
	Slug           string           `json:"slug"`
	Description    string           `json:"description"`
	Venue          string           `json:"venue"`
	City           string           `json:"city"`
	StartDate      string           `json:"startDate"`
	EndDate        string           `json:"endDate"`
	StartTime      string           `json:"startTime"`
	EndTime        string          `json:"endTime"`
	CoverImageUrl  string           `json:"coverImageUrl"`
	Status         repo.EventStatus `json:"status"`
	SalesStartDate string           `json:"salesStartDate"`
	SalesEndDate   string           `json:"salesEndDate"`
	CapacityRange  *models.CapacityRangeJSON			`json:"capacityRange"`
	TicketStats    TicketStatsResponse `json:"ticketStats"`

	CreatedAt      string      		`json:"createdAt"`
	
	UpdatedAt      string           `json:"updatedAt"`
}

type EventResponse struct{	
	ID				uuid.UUID 	`json:"id"`
	OrganizerID		uuid.UUID	`json:"organizerId,omitempty"`
	OrganizerName 	string		`json:"organizerName,omitempty"`

	Title          string           `json:"title"`
	Slug           string           `json:"slug"`
	Description    string           `json:"description"`
	Venue          string           `json:"venue"`
	City           string           `json:"city"`
	StartDate      string           `json:"startDate"`
	EndDate        string           `json:"endDate"`
	StartTime      string           `json:"startTime"`
	EndTime        string          `json:"endTime"`
	CoverImageUrl  string           `json:"coverImageUrl"`
	Status         repo.EventStatus `json:"status"`
	SalesStartDate string           `json:"salesStartDate"`
	SalesEndDate   string           `json:"salesEndDate"`
	CapacityRange  *models.CapacityRangeJSON			`json:"capacityRange"`
	TicketStats    TicketStatsResponse `json:"ticketStats"`
	UpdatedAt      string           `json:"updatedAt"`
}

type PublicEventResponse struct{	
	Title          string           `json:"title"`
	Slug           string           `json:"slug"`
	Description    string           `json:"description"`
	Venue          string           `json:"venue"`
	City           string           `json:"city"`
	StartDate      string           `json:"startDate"`
	EndDate        string           `json:"endDate"`
	StartTime      string           `json:"startTime"`
	EndTime        string          `json:"endTime"`
	CoverImageUrl  string           `json:"coverImageUrl"`
	Status         repo.EventStatus `json:"status"`
	SalesStartDate string           `json:"salesStartDate"`
	SalesEndDate   string           `json:"salesEndDate"`
	CapacityRange  *models.CapacityRangeJSON			`json:"capacityRange"`
	TicketStats    TicketStatsResponse `json:"ticketStats"`
	UpdatedAt      string           `json:"updatedAt"`
}

type CreateTicketTypeResponse struct {
    ID               uuid.UUID `json:"id"`
    EventID          uuid.UUID `json:"eventId"`
    Name             string    `json:"name"`
    Description      string    `json:"description"`
    Price            int32     `json:"price"`
    QuantityAvailable int32     `json:"quantityAvailable"`
    QuantitySold     int32     `json:"quantitySold"`
    IsActive         *bool      `json:"isActive"`
	UpdatedAt        string    `json:"updatedAt"`
	CreatedAt      string      		`json:"createdAt"`
}

type TicketTypeResponse struct {
    ID               uuid.UUID `json:"id"`
    EventID          uuid.UUID `json:"eventId"`
    Name             string    `json:"name,omitempty"`
    Description      string    `json:"description,omitempty"`
    Price            int32     `json:"price,omitempty"`
    QuantityAvailable int32     `json:"quantityAvailable,omitempty"`
    QuantitySold     int32     `json:"quantitySold,omitempty"`
    IsActive         *bool      `json:"isActive"`
	UpdatedAt        string    `json:"updatedAt"`
	
}

type OrderResponse struct {
	ID              uuid.UUID `json:"id"`
	EventID         uuid.UUID `json:"eventId"`
	TicketTypeID    uuid.UUID `json:"ticketTypeId"`
	AttendeeName    string    `json:"attendeeName"`
	AttendeePhone   string    `json:"attendeePhone"`
	AttendeeEmail   *string   `json:"attendeeEmail,omitempty"`
	Quantity        int32     `json:"quantity"`
	UnitPrice       int32     `json:"unitPrice"`
	TotalAmount     int32     `json:"totalAmount"`
	PaymentStatus   string    `json:"paymentStatus"`
	TransactionID   *string   `json:"transactionId,omitempty"`
	QRCodeHash      string    `json:"qrCodeHash"`
	QRCodeImageURL  string    `json:"qrCodeImageUrl"`
	IsUsed          bool      `json:"isUsed"`
	CreatedAt       string    `json:"createdAt"`
}



type PaymentResponse struct {
	TransactionID string `json:"transactionId"`
	Status        string `json:"status"`
}

type EventDetailsResponse struct {
	ID             uuid.UUID              `json:"id"`
	OrganizerID    uuid.UUID              `json:"organizerId"`
	Title          string                 `json:"title"`
	Slug           string                 `json:"slug"`
	Description    string                 `json:"description"`
	Venue          string                 `json:"venue"`
	City           string                 `json:"city"`
	StartDate      string                 `json:"startDate"`
	EndDate        string                 `json:"endDate"`
	StartTime      string                 `json:"startTime"`
	EndTime        string                 `json:"endTime"`
	CoverImageUrl  string                 `json:"coverImageUrl"`
	Status         string                 `json:"status"`
	SalesStartDate string                 `json:"salesStartDate"`
	SalesEndDate   string                 `json:"salesEndDate"`
	CapacityRange  *models.CapacityRangeJSON `json:"capacityRange,omitempty"`
	TicketStats    TicketStatsResponse    `json:"ticketStats"`
	CreatedAt      string                 `json:"createdAt"`
	UpdatedAt      string                 `json:"updatedAt"`
}

type TicketDetailsResponse struct {
	ID            uuid.UUID `json:"id"`
	AttendeeName  string    `json:"attendeeName"`
	AttendeePhone string    `json:"attendeePhone"`
	TicketType    string    `json:"ticketType"`
	Quantity      int32     `json:"quantity"`
	UnitPrice     int32     `json:"unitPrice"`
	TotalAmount   int32     `json:"totalAmount"`
	EventTitle    string    `json:"eventTitle"`
	EventDate     string    `json:"eventDate"`
	EventTime     string    `json:"eventTime"`
	EventVenue    string    `json:"eventVenue"`
	EventCity     string    `json:"eventCity"`
	QrCodeData    string    `json:"qrCodeData"`
	CreatedAt     string    `json:"createdAt"`
}

type CheckinHistoryResponse struct {
	OrderID      uuid.UUID `json:"orderId"`
	AttendeeName string    `json:"attendeeName"`
	AttendeePhone string   `json:"attendeePhone"`
	TicketType   string    `json:"ticketType"`
	CheckedInAt  string    `json:"checkedInAt"`
}

type TransactionResponse struct {
	OrderID      uuid.UUID `json:"orderId"`
	EventTitle   string    `json:"eventTitle"`
	AttendeeName string    `json:"attendeeName"`
	Amount       int32     `json:"amount"`
	PaymentStatus string   `json:"paymentStatus"`
	CreatedAt    string    `json:"createdAt"`
}
