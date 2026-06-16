package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/backend/internal/repository"
)

type OrderService struct {
	repo     *repository.Queries
	qr       *QRService
	payment  *PaymentService
	email    *EmailService
}

func NewOrderService(repo *repository.Queries, qr *QRService, payment *PaymentService, email *EmailService) *OrderService {
	return &OrderService{
		repo:    repo,
		qr:      qr,
		payment: payment,
		email:   email,
	}
}

func (s *OrderService) CreateOrder(eventID, ticketTypeID uuid.UUID, attendeeName, phone, email string, quantity int) (*repository.Order, string, error) {
	// Check ticket availability
	tt, err := s.repo.GetTicketType(context.Background(), ticketTypeID)
	if err != nil {
		return nil, "", err
	}
	if tt.QuantityAvailable-tt.QuantitySold < int32(quantity) {
		return nil, "", errors.New("not enough tickets")
	}
	total := tt.Price * int32(quantity)

	order, err := s.repo.CreateOrder(context.Background(), repository.CreateOrderParams{
		EventID:       eventID,
		TicketTypeID:  ticketTypeID,
		AttendeeName:  attendeeName,
		AttendeePhone: phone,
		AttendeeEmail: email,
		Quantity:      int32(quantity),
		UnitPrice:     tt.Price,
		TotalAmount:   total,
		PaymentStatus: "pending",
		PaymentMethod: "campay",
	})
	if err != nil {
		return nil, "", err
	}

	// Initiate CamPay payment
	transactionID, err := s.payment.RequestPayment(order.ID, int(total), phone, email, attendeeName)
	if err != nil {
		// mark order as failed
		s.repo.UpdateOrderPaymentStatus(context.Background(), repository.UpdateOrderPaymentStatusParams{
			ID:     order.ID,
			Status: "failed",
		})
		return nil, "", err
	}
	// Update order with transaction ID
	s.repo.UpdateOrderTransaction(context.Background(), repository.UpdateOrderTransactionParams{
		ID:            order.ID,
		TransactionID: transactionID,
	})
	return &order, transactionID, nil
}

func (s *OrderService) ConfirmPayment(transactionID string) error {
	order, err := s.repo.GetOrderByTransactionID(context.Background(), transactionID)
	if err != nil {
		return err
	}
	if order.PaymentStatus == "paid" {
		return nil // already processed
	}
	// Verify with CamPay
	verified, err := s.payment.VerifyPayment(transactionID)
	if err != nil || !verified {
		return errors.New("payment not verified")
	}
	// Update order
	if err := s.repo.UpdateOrderPaymentStatus(context.Background(), repository.UpdateOrderPaymentStatusParams{
		ID:     order.ID,
		Status: "paid",
	}); err != nil {
		return err
	}
	// Generate QR code
	qrHash, qrImage, err := s.qr.GenerateTicketQR(order.ID, order.AttendeeName)
	if err != nil {
		return err
	}
	if err := s.repo.UpdateOrderQR(context.Background(), repository.UpdateOrderQRParams{
		ID:            order.ID,
		QrCodeHash:    qrHash,
		QrCodeImageUrl: qrImage,
	}); err != nil {
		return err
	}
	// Send email receipt
	event, _ := s.repo.GetEvent(context.Background(), order.EventID)
	ticketType, _ := s.repo.GetTicketType(context.Background(), order.TicketTypeID)
	s.email.SendTicketReceipt(order.AttendeeEmail, order.AttendeeName, event.Title, ticketType.Name, int(order.Quantity), int(order.TotalAmount))
	return nil
}