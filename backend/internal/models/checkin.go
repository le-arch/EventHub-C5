package models

import "github.com/google/uuid"

type CheckInRequest struct {
	QRHash     string    `json:"qr_hash"`
	OrderID    uuid.UUID `json:"order_id"`
	ManualCode string    `json:"manual_code"`
}