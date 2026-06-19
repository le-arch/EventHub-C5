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

// CheckInService handles check-in operations for event attendees
type CheckInService struct {
	db *pgxpool.Pool
}

// NewCheckInService creates a new check-in service
func NewCheckInService(db *pgxpool.Pool) *CheckInService {
	return &CheckInService{db: db}
}

// CheckIn marks an order as checked in
func (s *CheckInService) CheckIn(ctx context.Context, orderID uuid.UUID, adminID uuid.UUID, userAgent, ipAddress string) error {
	// Get the order to verify it exists
	query := `SELECT id, event_id, attendee_name FROM orders WHERE id = $1`
	var order struct {
		ID           uuid.UUID
		EventID      uuid.UUID
		AttendeeName string
	}

	err := s.db.QueryRow(ctx, query, orderID).Scan(&order.ID, &order.EventID, &order.AttendeeName)
	if err == sql.ErrNoRows {
		return errors.New("order not found")
	}
	if err != nil {
		return fmt.Errorf("failed to get order: %w", err)
	}

	// Record check-in log
	logID := uuid.New()
	logQuery := `
		INSERT INTO check_in_logs (
			id, order_id, attendee_name, event_id, scanned_by, scanned_at, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
	`

	_, err = s.db.Exec(ctx, logQuery, logID, orderID, order.AttendeeName, order.EventID, adminID, ipAddress, userAgent)
	if err != nil {
		return fmt.Errorf("failed to record check-in: %w", err)
	}

	// Mark order as used
	updateQuery := `
		UPDATE orders
		SET is_used = true, used_at = NOW(), checked_in_by = $2, updated_at = NOW()
		WHERE id = $1
	`

	_, err = s.db.Exec(ctx, updateQuery, orderID, adminID)
	if err != nil {
		return fmt.Errorf("failed to mark order as used: %w", err)
	}

	return nil
}

// GetCheckInLog retrieves a check-in log by ID
func (s *CheckInService) GetCheckInLog(ctx context.Context, logID uuid.UUID) (*models.CheckInLog, error) {
	query := `
		SELECT id, order_id, attendee_name, event_id, scanned_by, scanned_at, ip_address, user_agent
		FROM check_in_logs
		WHERE id = $1
	`

	log := &models.CheckInLog{}
	err := s.db.QueryRow(ctx, query, logID).Scan(
		&log.ID,
		&log.OrderID,
		&log.AttendeeName,
		&log.EventID,
		&log.ScannedBy,
		&log.ScannedAt,
		&log.IPAddress,
		&log.UserAgent,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("check-in log not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get check-in log: %w", err)
	}

	return log, nil
}

// GetEventCheckIns retrieves all check-ins for an event
func (s *CheckInService) GetEventCheckIns(ctx context.Context, eventID uuid.UUID, limit, offset int) ([]models.CheckInLog, error) {
	query := `
		SELECT id, order_id, attendee_name, event_id, scanned_by, scanned_at, ip_address, user_agent
		FROM check_in_logs
		WHERE event_id = $1
		ORDER BY scanned_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(ctx, query, eventID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get check-ins: %w", err)
	}
	defer rows.Close()

	var logs []models.CheckInLog
	for rows.Next() {
		log := models.CheckInLog{}
		err := rows.Scan(
			&log.ID,
			&log.OrderID,
			&log.AttendeeName,
			&log.EventID,
			&log.ScannedBy,
			&log.ScannedAt,
			&log.IPAddress,
			&log.UserAgent,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan check-in log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, rows.Err()
}

// GetCheckInStats retrieves check-in statistics for an event
func (s *CheckInService) GetCheckInStats(ctx context.Context, eventID uuid.UUID) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_checkins,
			COUNT(DISTINCT scanned_by) as unique_scanners,
			MIN(scanned_at) as first_checkin,
			MAX(scanned_at) as last_checkin
		FROM check_in_logs
		WHERE event_id = $1
	`

	stats := map[string]interface{}{}
	var totalCheckIns, uniqueScanners interface{}
	var firstCheckIn, lastCheckIn *time.Time

	err := s.db.QueryRow(ctx, query, eventID).Scan(
		&totalCheckIns,
		&uniqueScanners,
		&firstCheckIn,
		&lastCheckIn,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get check-in stats: %w", err)
	}

	stats["total_checkins"] = totalCheckIns
	stats["unique_scanners"] = uniqueScanners
	stats["first_checkin"] = firstCheckIn
	stats["last_checkin"] = lastCheckIn

	return stats, nil
}
