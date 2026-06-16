package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/backend/internal/repository"
)

type AdminService struct {
	repo *repository.Queries
}

func NewAdminService(repo *repository.Queries) *AdminService {
	return &AdminService{repo: repo}
}

func (s *AdminService) GetAllUsers(limit, offset int) ([]repository.User, int64, error) {
	users, err := s.repo.ListUsers(context.Background(), repository.ListUsersParams{Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return nil, 0, err
	}
	count, _ := s.repo.CountUsers(context.Background())
	return users, count, nil
}

func (s *AdminService) VerifyUser(userID uuid.UUID) error {
	return s.repo.VerifyUser(context.Background(), userID)
}

func (s *AdminService) SuspendUser(userID uuid.UUID) error {
	return s.repo.SuspendUser(context.Background(), userID)
}

func (s *AdminService) UnsuspendUser(userID uuid.UUID) error {
	return s.repo.UnsuspendUser(context.Background(), userID)
}

func (s *AdminService) GetAllEvents(limit, offset int) ([]repository.Event, int64, error) {
	events, err := s.repo.ListAllEvents(context.Background(), repository.ListAllEventsParams{Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return nil, 0, err
	}
	count, _ := s.repo.CountEvents(context.Background())
	return events, count, nil
}

func (s *AdminService) CancelEvent(eventID uuid.UUID) error {
	return s.repo.CancelEvent(context.Background(), eventID)
}

func (s *AdminService) GetAllTransactions(limit, offset int) ([]repository.Order, int64, error) {
	orders, err := s.repo.ListAllOrders(context.Background(), repository.ListAllOrdersParams{Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return nil, 0, err
	}
	count, _ := s.repo.CountOrders(context.Background())
	return orders, count, nil
}

func (s *AdminService) RefundTransaction(transactionID string) error {
	// In real implementation, call CamPay refund API
	return s.repo.RefundOrder(context.Background(), transactionID)
}