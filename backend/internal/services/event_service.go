package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/backend/internal/repository"
)

type EventService struct {
	repo *repository.Queries
}

func NewEventService(repo *repository.Queries) *EventService {
	return &EventService{repo: repo}
}

func (s *EventService) CreateEvent(organizerID uuid.UUID, title, description, venueName, venueAddress, city string, startDate, endDate *string, startTime, endTime *string, coverImageURL *string, status string, salesStartDate, salesEndDate *string) (*repository.Event, error) {
	// Convert dates if needed (simplified)
	event, err := s.repo.CreateEvent(context.Background(), repository.CreateEventParams{
		OrganizerID:    organizerID,
		Title:          title,
		Description:    stringPtr(description),
		VenueName:      venueName,
		VenueAddress:   stringPtr(venueAddress),
		City:           city,
		StartDate:      parseDate(startDate),
		EndDate:        parseDatePtr(endDate),
		StartTime:      startTime,
		EndTime:        endTime,
		CoverImageUrl:  coverImageURL,
		Status:         status,
		SalesStartDate: parseDatePtr(salesStartDate),
		SalesEndDate:   parseDatePtr(salesEndDate),
	})
	return &event, err
}

func (s *EventService) GetEvent(eventID uuid.UUID) (*repository.Event, error) {
	event, err := s.repo.GetEvent(context.Background(), eventID)
	if err != nil {
		return nil, err
	}
	return &event, nil
}

func (s *EventService) GetPublicEvent(eventID uuid.UUID) (*repository.Event, error) {
	event, err := s.repo.GetPublicEvent(context.Background(), eventID)
	if err != nil {
		return nil, err
	}
	return &event, nil
}

func (s *EventService) GetEventsByOrganizer(organizerID uuid.UUID, limit, offset int) ([]repository.Event, error) {
	events, err := s.repo.ListEventsByOrganizer(context.Background(), repository.ListEventsByOrganizerParams{
		OrganizerID: organizerID,
		Limit:       int32(limit),
		Offset:      int32(offset),
	})
	return events, err
}

func (s *EventService) UpdateEvent(eventID uuid.UUID, updates map[string]interface{}) error {
	// Simplified; would map fields
	return s.repo.UpdateEvent(context.Background(), repository.UpdateEventParams{
		ID: eventID,
		// ... set fields
	})
}

func (s *EventService) DeleteEvent(eventID uuid.UUID) error {
	return s.repo.DeleteEvent(context.Background(), eventID)
}

func (s *EventService) PublishEvent(eventID uuid.UUID) error {
	return s.repo.PublishEvent(context.Background(), eventID)
}

func (s *EventService) UnpublishEvent(eventID uuid.UUID) error {
	return s.repo.UnpublishEvent(context.Background(), eventID)
}

// Helper functions
func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func parseDatePtr(s *string) *time.Time {
	if s == nil || *s == "" {
		return nil
	}
	t, _ := time.Parse("2006-01-02", *s)
	return &t
}