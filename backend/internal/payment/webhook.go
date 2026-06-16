package payment

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"os"
)

type WebhookHandler struct {
	secretKey string
}

func NewWebhookHandler() *WebhookHandler {
	return &WebhookHandler{
		secretKey: os.Getenv("CAMPAY_WEBHOOK_SECRET"),
	}
}

func (w *WebhookHandler) VerifySignature(payload []byte, signatureHeader string) bool {
	if w.secretKey == "" {
		return true // skip verification in development
	}
	mac := hmac.New(sha256.New, []byte(w.secretKey))
	mac.Write(payload)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(signatureHeader), []byte(expected))
}

func (w *WebhookHandler) ParseWebhook(r *http.Request) (map[string]interface{}, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}
	signature := r.Header.Get("X-CamPay-Signature")
	if !w.VerifySignature(body, signature) {
		return nil, fmt.Errorf("invalid signature")
	}
	var payload map[string]interface{}
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, err
	}
	return payload, nil
}