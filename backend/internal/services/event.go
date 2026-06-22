package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/le-arch/EventHub-C5/internal/models"
)

// EventService handles business logic for events
type EventService struct {
	db *pgxpool.Pool
}

// NewEventService creates a new event service
func NewEventService(db *pgxpool.Pool) *EventService {
	return &EventService{db: db}
}

// CreateEvent creates a new event
func (s *EventService) CreateEvent(ctx context.Context, event *models.Event) error {
	if event.ID == uuid.Nil {
		event.ID = uuid.New()
	}

	if event.CreatedAt.IsZero() {
		event.CreatedAt = time.Now()
	}

	if event.UpdatedAt.IsZero() {
		event.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO events (
			id, organizer_id, title, slug, description, venue_name, venue_address,
			city, start_date, end_date, start_time, end_time, cover_image_url,
			status, sales_start_date, sales_end_date, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
		)
	`

	_, err := s.db.Exec(ctx, query,
		event.ID,
		event.OrganizerID,
		event.Title,
		event.Slug,
		event.Description,
		event.VenueName,
		event.VenueAddress,
		event.City,
		event.StartDate,
		event.EndDate,
		event.StartTime,
		event.EndTime,
		event.CoverImageURL,
		event.Status,
		event.SalesStartDate,
		event.SalesEndDate,
		event.CreatedAt,
		event.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	return nil
}

// GetEvent retrieves an event by ID
func (s *EventService) GetEvent(ctx context.Context, eventID uuid.UUID) (*models.Event, error) {
	query := `
		SELECT 
			id, organizer_id, title, slug, description, venue_name, venue_address,
			city, start_date, end_date, start_time, end_time, cover_image_url,
			status, sales_start_date, sales_end_date, created_at, updated_at
		FROM events
		WHERE id = $1
	`

	event := &models.Event{}
	err := s.db.QueryRow(ctx, query, eventID).Scan(
		&event.ID,
		&event.OrganizerID,
		&event.Title,
		&event.Slug,
		&event.Description,
		&event.VenueName,
		&event.VenueAddress,
		&event.City,
		&event.StartDate,
		&event.EndDate,
		&event.StartTime,
		&event.EndTime,
		&event.CoverImageURL,
		&event.Status,
		&event.SalesStartDate,
		&event.SalesEndDate,
		&event.CreatedAt,
		&event.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("event not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	return event, nil
}

// GetEventBySlug retrieves an event by its slug
func (s *EventService) GetEventBySlug(ctx context.Context, slug string) (*models.Event, error) {
	query := `
		SELECT 
			id, organizer_id, title, slug, description, venue_name, venue_address,
			city, start_date, end_date, start_time, end_time, cover_image_url,
			status, sales_start_date, sales_end_date, created_at, updated_at
		FROM events
		WHERE slug = $1
	`

	event := &models.Event{}
	err := s.db.QueryRow(ctx, query, slug).Scan(
		&event.ID,
		&event.OrganizerID,
		&event.Title,
		&event.Slug,
		&event.Description,
		&event.VenueName,
		&event.VenueAddress,
		&event.City,
		&event.StartDate,
		&event.EndDate,
		&event.StartTime,
		&event.EndTime,
		&event.CoverImageURL,
		&event.Status,
		&event.SalesStartDate,
		&event.SalesEndDate,
		&event.CreatedAt,
		&event.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("event not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	return event, nil
}

// GetEventsByOrganizer retrieves all events for an organizer
func (s *EventService) GetEventsByOrganizer(ctx context.Context, organizerID uuid.UUID, limit, offset int) ([]models.Event, error) {
	query := `
		SELECT 
			id, organizer_id, title, slug, description, venue_name, venue_address,
			city, start_date, end_date, start_time, end_time, cover_image_url,
			status, sales_start_date, sales_end_date, created_at, updated_at
		FROM events
		WHERE organizer_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(ctx, query, organizerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		event := models.Event{}
		err := rows.Scan(
			&event.ID,
			&event.OrganizerID,
			&event.Title,
			&event.Slug,
			&event.Description,
			&event.VenueName,
			&event.VenueAddress,
			&event.City,
			&event.StartDate,
			&event.EndDate,
			&event.StartTime,
			&event.EndTime,
			&event.CoverImageURL,
			&event.Status,
			&event.SalesStartDate,
			&event.SalesEndDate,
			&event.CreatedAt,
			&event.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	return events, rows.Err()
}

// UpdateEvent updates an event
func (s *EventService) UpdateEvent(ctx context.Context, event *models.Event) error {
	event.UpdatedAt = time.Now()

	query := `
		UPDATE events
		SET 
			title = $2,
			slug = $3,
			description = $4,
			venue_name = $5,
			venue_address = $6,
			city = $7,
			start_date = $8,
			end_date = $9,
			start_time = $10,
			end_time = $11,
			cover_image_url = $12,
			status = $13,
			sales_start_date = $14,
			sales_end_date = $15,
			updated_at = $16
		WHERE id = $1
	`

	result, err := s.db.Exec(ctx, query,
		event.ID,
		event.Title,
		event.Slug,
		event.Description,
		event.VenueName,
		event.VenueAddress,
		event.City,
		event.StartDate,
		event.EndDate,
		event.StartTime,
		event.EndTime,
		event.CoverImageURL,
		event.Status,
		event.SalesStartDate,
		event.SalesEndDate,
		event.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("event not found")
	}

	return nil
}

// DeleteEvent deletes an event
func (s *EventService) DeleteEvent(ctx context.Context, eventID uuid.UUID) error {
	query := `DELETE FROM events WHERE id = $1`

	result, err := s.db.Exec(ctx, query, eventID)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("event not found")
	}

	return nil
}

// PublishEvent publishes an event
func (s *EventService) PublishEvent(ctx context.Context, eventID uuid.UUID) error {
	query := `UPDATE events SET status = 'published', updated_at = NOW() WHERE id = $1`
	_, err := s.db.Exec(ctx, query, eventID)
	if err != nil {
		return fmt.Errorf("failed to publish event: %w", err)
	}
	return nil
}

// UnpublishEvent unpublishes an event
func (s *EventService) UnpublishEvent(ctx context.Context, eventID uuid.UUID) error {
	query := `UPDATE events SET status = 'draft', updated_at = NOW() WHERE id = $1`
	_, err := s.db.Exec(ctx, query, eventID)
	if err != nil {
		return fmt.Errorf("failed to unpublish event: %w", err)
	}
	return nil
}

// GetPublishedEvents retrieves all published events
func (s *EventService) GetPublishedEvents(ctx context.Context, limit, offset int) ([]models.Event, error) {
	query := `
		SELECT 
			id, organizer_id, title, slug, description, venue_name, venue_address,
			city, start_date, end_date, start_time, end_time, cover_image_url,
			status, sales_start_date, sales_end_date, created_at, updated_at
		FROM events
		WHERE status = 'published'
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := s.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		event := models.Event{}
		err := rows.Scan(
			&event.ID,
			&event.OrganizerID,
			&event.Title,
			&event.Slug,
			&event.Description,
			&event.VenueName,
			&event.VenueAddress,
			&event.City,
			&event.StartDate,
			&event.EndDate,
			&event.StartTime,
			&event.EndTime,
			&event.CoverImageURL,
			&event.Status,
			&event.SalesStartDate,
			&event.SalesEndDate,
			&event.CreatedAt,
			&event.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	return events, rows.Err()
}
