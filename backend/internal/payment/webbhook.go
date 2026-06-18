// webhook handler for processing payment notifications
package payment

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
)


type WebhookHandler struct {
	querier repo.Querier
	secret  string
}

func NewWebhookHandler(querier repo.Querier, secret string) *WebhookHandler {
	return &WebhookHandler{querier: querier, secret: secret}
}

func (wh *WebhookHandler) verifySignature(body []byte, signatureHeader string) bool {
	mac := hmac.New(sha256.New, []byte(wh.secret))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signatureHeader))
}


func (wh *WebhookHandler) HandleMomoWebhook(c *gin.Context) {
	sig := c.GetHeader("X-Signature")
	body, _ := c.GetRawData() // you need to read body once
	if sig == "" || !wh.verifySignature(body, sig) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
		return
	}

	var payload models.MomoWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	// Log webhook (you already have InsertWebhookLog)
	headers, _ := json.Marshal(c.Request.Header)
	payloadBytes, _ := json.Marshal(payload)
	_, _ = wh.querier.InsertWebhookLog(c, repo.InsertWebhookLogParams{
		Gateway:        "mtn_momo",
		Payload:        payloadBytes,
		Headers:        headers,
		SignatureValid: nil,
		Processed:      nil,
		ErrorMessage:   "",
	})

	// Find order by transaction ID
	if payload.TransactionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing transactionId"})
		return
	}
	txID := &payload.TransactionID
	order, err := wh.querier.GetOrderByTransactionID(c, txID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	// Determine new status
	var newStatus repo.PaymentStatus
	switch payload.Status {
	case "SUCCESSFUL":
		newStatus = repo.PaymentStatusPaid
		// Decrement ticket quantity
		rows, err := wh.querier.DecrementTicketQuantity(c, repo.DecrementTicketQuantityParams{
			ID:                order.TicketTypeID,
			QuantityAvailable: order.Quantity,
		})
		if err != nil || rows == 0 {
			newStatus = repo.PaymentStatusFailed
		}
	default:
		newStatus = repo.PaymentStatusFailed
	}

	// Update order
	err = wh.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: newStatus,
		TransactionID: txID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "processed"})
}