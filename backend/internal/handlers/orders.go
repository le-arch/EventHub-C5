// order related handlers for creating, updating, and deleting orders
package handlers

import (
	"net/http"
	"net/netip"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/qrcode"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleCreateOrder(c *gin.Context) {
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	clientIP := c.ClientIP()
	var ipPtr *netip.Addr
	if clientIP != "" {
		if parsed, err := netip.ParseAddr(clientIP); err == nil {
			ipPtr = &parsed
		}
	}

deviceInfo := c.GetHeader("User-Agent")
var devicePtr string
if deviceInfo != "" {
    devicePtr = deviceInfo
}

	// Validate ticket
	ticket, err := h.querier.GetTicketTypeByID(c, req.TicketTypeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ticket type not found"})
		return
	}
	if ticket.EventID != req.EventID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket type does not belong to this event"})
		return
	}
	if ticket.IsActive == nil || !*ticket.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket type is inactive"})
		return
	}
	if ticket.QuantityAvailable < int32(req.Quantity) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not enough tickets available"})
		return
	}

	//  Compute total
	total := ticket.Price * int32(req.Quantity)

	// attendie can only order for one ticket. it now depend on the ticket type how many people are accepted for that ticket
	if req.Quantity != 1 {
    c.JSON(http.StatusBadRequest, gin.H{"error": "only one ticket per order is allowed"})
    return
	}

	// Generate QR hash (HMAC)
	salt := uuid.New().String()
	qrHash := qrcode.GenerateQRHash(req.AttendeeName+salt, h.qrSecret)

	qrPlaintext := qrHash

	// Create order (pending)
	var emailPtr *string
	if req.AttendeeEmail != "" {
		emailPtr = &req.AttendeeEmail
	}

	const platformFeePercent = 5
	platformFee := (total * platformFeePercent) / 100

	order, err := h.querier.CreateOrder(c, repo.CreateOrderParams{
		EventID:       req.EventID,
		TicketTypeID:  req.TicketTypeID,
		AttendeeName:  req.AttendeeName,
		AttendeePhone: req.AttendeePhone,
		AttendeeEmail: emailPtr,
		Quantity:      int32(req.Quantity),
		UnitPrice:     ticket.Price,
		TotalAmount:   total,
		PaymentStatus: repo.PaymentStatusPending,
		TransactionID: nil,
		QrCodeHash:    qrHash,
		QrCodePlaintext: qrPlaintext,
		QrCodeImageUrl:  "", 
		DeviceInfo: devicePtr,     
    	IpAddress:  ipPtr, 
    	PlatformFee:   platformFee,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order: " + err.Error()})
		return
	}

	// Initiate Momo payment
	momoReq := models.PaymentRequest{
		Amount:       float64(total),
		Currency:     "XAF",
		ExternalID:   order.ID.String(),
		Payer:        req.AttendeePhone,
		PayerMessage: "Ticket payment",
		PayeeNote:    "Order " + order.ID.String(),
	}
	momoResp, err := h.momoClient.RequestPayment(c.Request.Context(), momoReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "payment initiation failed: " + err.Error()})
		return
	}

	// Update order with transaction ID
	txID := momoResp.TransactionID
	_ = h.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: repo.PaymentStatusPending,
		TransactionID: &txID,
	})

	// Generate QR image (sync – can be async)
	qrImageURL, _ := qrcode.GenerateAndUpload(c.Request.Context(),
		order.ID.String(), req.AttendeeName, qrHash, h.MinioClient)
	// If error, just leave empty; you can retry later.

	response := utils.OrderResponse{
		ID:             order.ID,
		EventID:        order.EventID,
		TicketTypeID:   order.TicketTypeID,
		AttendeeName:   order.AttendeeName,
		AttendeePhone:  order.AttendeePhone,
		AttendeeEmail:  order.AttendeeEmail,
		Quantity:       order.Quantity,
		UnitPrice:      order.UnitPrice,
		TotalAmount:    order.TotalAmount,
		PaymentStatus:  string(order.PaymentStatus),
		TransactionID:  &txID,
		QRCodeHash:     order.QrCodeHash,
		QRCodeImageURL: qrImageURL,
		IsUsed:         order.IsUsed,
		CreatedAt:      utils.FormatDateTime(order.CreatedAt),
	}
	c.JSON(http.StatusCreated, response)
}

func (h *EventHubHandler) handleGetOrderStatus(c *gin.Context) {
    //  Get authenticated user ID
    userID, err := utils.ExtractOrganizerID(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }

    // 2. Parse order ID
    orderIDStr := c.Param("id")
    orderID, err := uuid.Parse(orderIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
        return
    }

    // 3. Fetch order
    order, err := h.querier.GetOrderByID(c, orderID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
        return
    }

    // 4. Fetch event and check ownership
    event, err := h.querier.GetEventByID(c, order.EventID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
        return
    }

    // 5. Authorization: only organizer or admin
    if event.OrganizerID != userID {
        // Check if user is admin
        role, _ := utils.GetUserRole(c)
        if role != "admin" {
            c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized to view this order"})
            return
        }
    }

    // 6. Generate QR image if paid and missing (optional)
    if order.PaymentStatus == repo.PaymentStatusPaid && order.QrCodeImageUrl == "" {
        qrURL, _ := qrcode.GenerateAndUpload(c.Request.Context(),
            order.ID.String(), order.AttendeeName, order.QrCodeHash, h.MinioClient)
        if qrURL != "" {
            _ = h.querier.UpdateOrderQRImage(c, repo.UpdateOrderQRImageParams{
                ID:             order.ID,
                QrCodeImageUrl: qrURL,
            })
            order.QrCodeImageUrl = qrURL
        }
    }

	c.JSON(http.StatusOK,gin.H{
        "id":                order.ID,
        "event_id":          order.EventID,
        "attendee_name":     order.AttendeeName,
        "attendee_phone":    order.AttendeePhone,
        "quantity":          order.Quantity,
        "total_amount":      order.TotalAmount,
        "payment_status":    order.PaymentStatus,
        "transaction_id":    order.TransactionID,
        "qr_code_image_url": order.QrCodeImageUrl,
        "is_used":           order.IsUsed,
        "created_at":        utils.FormatDateTime(order.CreatedAt),
    })
}
