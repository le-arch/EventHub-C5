package handlers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/backend/internal/services"
)

type WebhookHandler struct {
	orderService   *services.OrderService
	paymentService *services.PaymentService
}

func NewWebhookHandler(os *services.OrderService, ps *services.PaymentService) *WebhookHandler {
	return &WebhookHandler{
		orderService:   os,
		paymentService: ps,
	}
}

func (h *WebhookHandler) HandleCamPay(c *gin.Context) {
	body, _ := io.ReadAll(c.Request.Body)
	var webhook struct {
		TransactionID string `json:"transaction_id"`
		Status        string `json:"status"`
	}
	if err := c.ShouldBindJSON(&webhook); err != nil {
		c.AbortWithStatusJSON(400, gin.H{"error": "invalid payload"})
		return
	}
	if webhook.Status == "completed" {
		if err := h.orderService.ConfirmPayment(webhook.TransactionID); err != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "failed to process"})
			return
		}
	}
	c.JSON(200, gin.H{"status": "ok"})
}