package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/backend/internal/repository"
)

type CheckinService struct {
	repo *repository.Queries
	qr   *QRService
}

func NewCheckinService(repo *repository.Queries, qr *QRService) *CheckinService {
	return &CheckinService{repo: repo, qr: qr}
}

func (s *CheckinService) ScanQR(payload string, scannerID uuid.UUID) (*repository.Order, error) {
	orderID, attendeeName, err := s.qr.ValidateQR(payload)
	if err != nil {
		return nil, err
	}
	order, err := s.repo.GetOrder(context.Background(), orderID)
	if err != nil {
		return nil, errors.New("ticket not found")
	}
	if order.IsUsed {
		return nil, errors.New("ticket already used")
	}
	if order.AttendeeName != attendeeName {
		return nil, errors.New("name mismatch")
	}
	// Mark as used
	if err := s.repo.MarkOrderUsed(context.Background(), repository.MarkOrderUsedParams{
		ID:           order.ID,
		IsUsed:       true,
		UsedAt:       time.Now(),
		CheckedInBy:   scannerID,
	}); err != nil {
		return nil, err
	}
	// Log check-in
	s.repo.CreateCheckInLog(context.Background(), repository.CreateCheckInLogParams{
		OrderID:      order.ID,
		AttendeeName: order.AttendeeName,
		EventID:      order.EventID,
		ScannedBy:    scannerID,
	})
	return &order, nil
}