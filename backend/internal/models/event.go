package models

import (
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
)

type CreateEventRequest struct {
	OrganizerID    uuid.UUID        `json:"organizer_id" binding:"required"`
	Title          string           `json:"title" binding:"required"`
	Slug           string           `json:"slug" binding:"required"`
	Description    string           `json:"description" binding:"required"`
	Venue          string           `json:"venue" binding:"required"`
	City           string           `json:"city" binding:"required"`
	StartDate      string           `json:"start_date" binding:"required"`
	EndDate        string           `json:"end_date"`
	StartTime      string           `json:"start_time" binding:"required"`
	EndTime        string           `json:"end_time" binding:"required"`
	CoverImageUrl  string           `json:"cover_image_url"`
	Status         repo.EventStatus          `json:"status"`
	SalesStartDate string           `json:"sales_start_date"`
	SalesEndDate   string           `json:"sales_end_date"`

}