package models

import (
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
)

// CapacityRangeJSON is the JSON representation of int4range.
type CapacityRangeJSON struct {
    Lower  int32  `json:"lower"`
    Upper  int32  `json:"upper"`
    Bounds string `json:"bounds,omitempty"` // "[)", "(]", "[]", "()"
}


type CreateEventRequest struct {
	OrganizerID    uuid.UUID        `json:"organizer_id" `
	Title          string           `json:"title" binding:"required"`
	Slug           string           `json:"slug" binding:"required"`
	Description    string           `json:"description" binding:"required"`
	Venue          string           `json:"venue" binding:"required"`
	City           string           `json:"city" binding:"required"`
	StartDate      string           `json:"start_date" binding:"required"`
	EndDate        string           `json:"end_date"`
	StartTime      *string           `json:"start_time" binding:"required"`
	EndTime        *string           `json:"end_time" binding:"required"`
	CoverImageUrl  string           `json:"cover_image_url"`
	Status         repo.EventStatus          `json:"status"`
	SalesStartDate string           `json:"sales_start_date"`
	SalesEndDate   string           `json:"sales_end_date"`
	CapacityRange *CapacityRangeJSON `json:"capacity_range"`

}

type UpdateEventRequest struct {
    Title          *string `json:"title,omitempty"`
    Slug           *string `json:"slug,omitempty"`
    Description    string `json:"description,omitempty"`
    Venue          string `json:"venue,omitempty"`
    City           *string `json:"city,omitempty"`
    StartDate      *string `json:"start_date,omitempty"`  
    EndDate        *string `json:"end_date,omitempty"`
    StartTime      *string `json:"start_time,omitempty"`
    EndTime        *string `json:"end_time,omitempty"`
    CoverImageUrl  string `json:"cover_image_url,omitempty"`
    Status         *repo.EventStatus `json:"status,omitempty"`
    SalesStartDate *string `json:"sales_start_date,omitempty"`
    SalesEndDate   *string `json:"sales_end_date,omitempty"`
	CapacityRange *CapacityRangeJSON `json:"capacity_range,omitempty"`
}

type UpdateEventStatusRequest struct {
	Status   repo.EventStatus `json:"status" binding:"required"`
}

type UpdateEventStatus struct {
	Status   repo.EventStatus `json:"status" binding:"required,oneof=draft published cancelled archived"`
}

// for event tickets
type CreateTicketTypeRequest struct {
	Name             string `json:"name" binding:"required"`
    Description      string `json:"description"`
    Price            int32  `json:"price" binding:"required,min=0"`
    QuantityAvailable int32 `json:"quantity_available" binding:"required,min=0"`
    IsActive         *bool  `json:"is_active"`
}

type UpdateTicketTypeRequest struct {
    Name             *string `json:"name"`
    Description      string `json:"description"`
    Price            *int32  `json:"price"`
    QuantityAvailable *int32 `json:"quantity_available"`
    IsActive         *bool   `json:"is_active"`
}