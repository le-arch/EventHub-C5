package models

type CheckInRequest struct {
		QRHash string `json:"qr_hash" binding:"required"`
	}