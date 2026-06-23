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

// TicketService handles business logic for ticket types
type TicketService struct {
	db *pgxpool.Pool
}

// NewTicketService creates a new ticket service
func NewTicketService(db *pgxpool.Pool) *TicketService {
	return &TicketService{db: db}
}

// CreateTicketType creates a new ticket type
func (s *TicketService) CreateTicketType(ctx context.Context, ticket *models.TicketType) error {
	if ticket.ID == uuid.Nil {
		ticket.ID = uuid.New()
	}

	if ticket.CreatedAt.IsZero() {
		ticket.CreatedAt = time.Now()
	}

	if ticket.UpdatedAt.IsZero() {
		ticket.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO ticket_types (
			id, event_id, name, description, price, quantity_available,
			quantity_sold, is_active, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`

	_, err := s.db.Exec(ctx, query,
		ticket.ID,
		ticket.EventID,
		ticket.Name,
		ticket.Description,
		ticket.Price,
		ticket.QuantityAvailable,
		ticket.QuantitySold,
		ticket.IsActive,
		ticket.CreatedAt,
		ticket.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create ticket type: %w", err)
	}

	return nil
}

// GetTicketType retrieves a ticket type by ID
func (s *TicketService) GetTicketType(ctx context.Context, ticketTypeID uuid.UUID) (*models.TicketType, error) {
	query := `
		SELECT 
			id, event_id, name, description, price, quantity_available,
			quantity_sold, is_active, created_at, updated_at
		FROM ticket_types
		WHERE id = $1
	`

	ticket := &models.TicketType{}
	err := s.db.QueryRow(ctx, query, ticketTypeID).Scan(
		&ticket.ID,
		&ticket.EventID,
		&ticket.Name,
		&ticket.Description,
		&ticket.Price,
		&ticket.QuantityAvailable,
		&ticket.QuantitySold,
		&ticket.IsActive,
		&ticket.CreatedAt,
		&ticket.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("ticket type not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get ticket type: %w", err)
	}

	return ticket, nil
}

// GetEventTicketTypes retrieves all ticket types for an event
func (s *TicketService) GetEventTicketTypes(ctx context.Context, eventID uuid.UUID) ([]models.TicketType, error) {
	query := `
		SELECT 
			id, event_id, name, description, price, quantity_available,
			quantity_sold, is_active, created_at, updated_at
		FROM ticket_types
		WHERE event_id = $1
		ORDER BY created_at ASC
	`

	rows, err := s.db.Query(ctx, query, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get ticket types: %w", err)
	}
	defer rows.Close()

	var tickets []models.TicketType
	for rows.Next() {
		ticket := models.TicketType{}
		err := rows.Scan(
			&ticket.ID,
			&ticket.EventID,
			&ticket.Name,
			&ticket.Description,
			&ticket.Price,
			&ticket.QuantityAvailable,
			&ticket.QuantitySold,
			&ticket.IsActive,
			&ticket.CreatedAt,
			&ticket.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan ticket type: %w", err)
		}
		tickets = append(tickets, ticket)
	}

	return tickets, rows.Err()
}

// UpdateTicketType updates a ticket type
func (s *TicketService) UpdateTicketType(ctx context.Context, ticket *models.TicketType) error {
	ticket.UpdatedAt = time.Now()

	query := `
		UPDATE ticket_types
		SET 
			name = $2,
			description = $3,
			price = $4,
			quantity_available = $5,
			is_active = $6,
			updated_at = $7
		WHERE id = $1
	`

	result, err := s.db.Exec(ctx, query,
		ticket.ID,
		ticket.Name,
		ticket.Description,
		ticket.Price,
		ticket.QuantityAvailable,
		ticket.IsActive,
		ticket.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update ticket type: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("ticket type not found")
	}

	return nil
}

// IncrementSoldQuantity increments the sold quantity and decrements available
func (s *TicketService) IncrementSoldQuantity(ctx context.Context, ticketTypeID uuid.UUID, quantity int) error {
	query := `
		UPDATE ticket_types
		SET 
			quantity_sold = quantity_sold + $2,
			quantity_available = quantity_available - $2,
			updated_at = NOW()
		WHERE id = $1 AND quantity_available >= $2
	`

	result, err := s.db.Exec(ctx, query, ticketTypeID, quantity)
	if err != nil {
		return fmt.Errorf("failed to increment sold quantity: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("insufficient ticket quantity available")
	}

	return nil
}

// DecrementSoldQuantity decrements the sold quantity and increments available
func (s *TicketService) DecrementSoldQuantity(ctx context.Context, ticketTypeID uuid.UUID, quantity int) error {
	query := `
		UPDATE ticket_types
		SET 
			quantity_sold = quantity_sold - $2,
			quantity_available = quantity_available + $2,
			updated_at = NOW()
		WHERE id = $1
	`

	_, err := s.db.Exec(ctx, query, ticketTypeID, quantity)
	if err != nil {
		return fmt.Errorf("failed to decrement sold quantity: %w", err)
	}

	return nil
}

// GetTicketStats retrieves ticket statistics for an event
func (s *TicketService) GetTicketStats(ctx context.Context, eventID uuid.UUID) (map[string]interface{}, error) {
	query := `
		SELECT 
			SUM(quantity_available) as total_available,
			SUM(quantity_sold) as total_sold,
			SUM(quantity_available + quantity_sold) as total_capacity
		FROM ticket_types
		WHERE event_id = $1
	`

	stats := map[string]interface{}{}
	var totalAvailable, totalSold, totalCapacity interface{}

	err := s.db.QueryRow(ctx, query, eventID).Scan(
		&totalAvailable,
		&totalSold,
		&totalCapacity,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get ticket stats: %w", err)
	}

	stats["total_available"] = totalAvailable
	stats["total_sold"] = totalSold
	stats["total_capacity"] = totalCapacity

	return stats, nil
}
