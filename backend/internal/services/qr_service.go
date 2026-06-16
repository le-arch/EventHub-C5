package services

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
)

type QRService struct {
	secretKey string
}

func NewQRService() *QRService {
	key := os.Getenv("QR_SECRET_KEY")
	if key == "" {
		key = "default-qr-secret-change-me"
	}
	return &QRService{secretKey: key}
}

func (s *QRService) GenerateTicketQR(orderID uuid.UUID, attendeeName string) (hash string, png []byte, err error) {
	data := fmt.Sprintf("%s|%s", orderID.String(), attendeeName)
	h := hmac.New(sha256.New, []byte(s.secretKey))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))
	payload := fmt.Sprintf("%s|%s|%s", orderID.String(), attendeeName, signature)

	png, err = qrcode.Encode(payload, qrcode.Medium, 256)
	if err != nil {
		return "", nil, err
	}
	return payload, png, nil
}

func (s *QRService) ValidateQR(payload string) (orderID uuid.UUID, attendeeName string, err error) {
	parts := splitPayload(payload)
	if len(parts) != 3 {
		return uuid.Nil, "", fmt.Errorf("invalid QR format")
	}
	oid, _ := uuid.Parse(parts[0])
	name := parts[1]
	signature := parts[2]

	data := fmt.Sprintf("%s|%s", oid.String(), name)
	h := hmac.New(sha256.New, []byte(s.secretKey))
	h.Write([]byte(data))
	expected := hex.EncodeToString(h.Sum(nil))
	if !hmac.Equal([]byte(signature), []byte(expected)) {
		return uuid.Nil, "", fmt.Errorf("invalid signature")
	}
	return oid, name, nil
}

func splitPayload(payload string) []string {
	var parts []string
	start := 0
	for i, c := range payload {
		if c == '|' {
			parts = append(parts, payload[start:i])
			start = i + 1
		}
	}
	if start < len(payload) {
		parts = append(parts, payload[start:])
	}
	return parts
}