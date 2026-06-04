// utility functions for standardizing API responses and error handling
package utils

import (
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
)

// RegisterResponse defines the structure of the response sent back to the client after a successful registration
type RegisterResponse struct {
	ID string `json:"id"`
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
	CreatedAt      string      
	
	UpdatedAt      string           `json:"updated_at"`
}