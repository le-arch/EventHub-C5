package qr

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

func (q *QRService) ValidateQR(payload string) (orderID uuid.UUID, attendeeName string, err error) {
	parts := strings.Split(payload, "|")
	if len(parts) != 3 {
		return uuid.Nil, "", errors.New("invalid QR format")
	}
	oid, err := uuid.Parse(parts[0])
	if err != nil {
		return uuid.Nil, "", errors.New("invalid order ID")
	}
	name := parts[1]
	signature := parts[2]

	data := fmt.Sprintf("%s|%s", oid.String(), name)
	h := hmac.New(sha256.New, []byte(q.secretKey))
	h.Write([]byte(data))
	expected := hex.EncodeToString(h.Sum(nil))
	if !hmac.Equal([]byte(signature), []byte(expected)) {
		return uuid.Nil, "", errors.New("invalid signature")
	}
	return oid, name, nil
}