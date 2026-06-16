package qr

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
)

type QRService struct {
	secretKey string
}

func NewQRService(secretKey string) *QRService {
	return &QRService{secretKey: secretKey}
}

func (q *QRService) GenerateTicketQR(orderID uuid.UUID, attendeeName string) (hash string, png []byte, err error) {
	data := fmt.Sprintf("%s|%s", orderID.String(), attendeeName)
	h := hmac.New(sha256.New, []byte(q.secretKey))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))
	payload := fmt.Sprintf("%s|%s|%s", orderID.String(), attendeeName, signature)

	png, err = qrcode.Encode(payload, qrcode.Medium, 256)
	if err != nil {
		return "", nil, err
	}
	return payload, png, nil
}