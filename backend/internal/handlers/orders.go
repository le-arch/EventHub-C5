// order related handlers for creating, updating, and deleting orders
package handlers

import (
	"fmt"
	"log"
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
		Amount:       fmt.Sprintf("%d", total),
		Currency:     "EUR",
		ExternalID:   order.ID.String(),
		Payer:      models.Party{
			PartyIDType: "MSISDN",
		 	PartyID: req.AttendeePhone,
		 } ,
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
	paymentStatus := repo.PaymentStatusPending

	if h.momoClient.IsSandbox() {
		paymentStatus = repo.PaymentStatusPaid
		_, err := h.querier.DecrementTicketQuantity(c, repo.DecrementTicketQuantityParams{
			ID:                order.TicketTypeID,
			QuantityAvailable: order.Quantity,
		})
		if err != nil {
			log.Printf("Failed to decrement ticket quantity in sandbox mode: %v", err)
		}
	}

	_ = h.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: paymentStatus,
		TransactionID: &txID,
	})

	// Generate QR image (sync – can be async)
	qrImageURL, _ := qrcode.GenerateAndUpload(c.Request.Context(),
		order.ID.String(), req.AttendeeName, qrHash, h.MinioClient)
	if qrImageURL != "" {
    err := h.querier.UpdateOrderQRImage(c, repo.UpdateOrderQRImageParams{
        ID:             order.ID,
        QrCodeImageUrl: qrImageURL,
    })
    if err != nil {
        log.Printf("Failed to update QR image URL for order %s: %v", order.ID, err)
    }
}

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
		PaymentStatus:  string(paymentStatus),
		TransactionID:  &txID,
		QRCodeHash:     order.QrCodeHash,
		QRCodeImageURL: qrImageURL,
		IsUsed:         order.IsUsed,
		CreatedAt:      utils.FormatDateTime(order.CreatedAt),
	}
	c.JSON(http.StatusCreated, response)
}

func (h *EventHubHandler) handleGetOrderStatus(c *gin.Context) {
    // 1. Parse order ID
    orderIDStr := c.Param("id")
    orderID, err := uuid.Parse(orderIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
        return
    }

    // 2. Fetch order
    order, err := h.querier.GetOrderByID(c, orderID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
        return
    }

    // 3. Check if authenticated 
    userID, authErr := utils.ExtractOrganizerID(c) // returns error if not authenticated
    var isOrganizer bool
    var isAdmin bool

    if authErr == nil {
        // User is authenticated – check admin role
        role, roleErr := utils.GetUserRole(c)
        if roleErr == nil && role == "admin" {
            isAdmin = true
        }
        if !isAdmin {
            // Check if user is the event organizer
            event, err := h.querier.GetEventByID(c, order.EventID)
            if err == nil && event.OrganizerID == userID {
                isOrganizer = true
            }
        }
    }

    // 4. Build base response (public)
    baseResponse := gin.H{
        "id":                order.ID,
        "event_id":          order.EventID,
        "attendee_name":     order.AttendeeName,
        "attendee_phone":    order.AttendeePhone,
        "attendee_email":    order.AttendeeEmail,
        "quantity":          order.Quantity,
        "total_amount":      order.TotalAmount,
        "payment_status":    order.PaymentStatus,
        "qr_code_image_url": order.QrCodeImageUrl,
        "is_used":           order.IsUsed,
        "created_at":        utils.FormatDateTime(order.CreatedAt),
    }

    // 5. If authenticated as organizer or admin, add financial details
    if isAdmin || isOrganizer {
        platformFee := order.PlatformFee 
        netAmount := order.TotalAmount - platformFee

        fullResponse := baseResponse
        fullResponse["unit_price"] = order.UnitPrice
        fullResponse["platform_fee"] = platformFee
        fullResponse["net_amount"] = netAmount
        fullResponse["transaction_id"] = order.TransactionID
        fullResponse["payment_method"] = order.PaymentMethod
        fullResponse["payment_webhook_received"] = order.PaymentWebhookReceived
        c.JSON(http.StatusOK, fullResponse)
        return
    }

    // 6. Otherwise, return only public fields
    c.JSON(http.StatusOK, baseResponse)
}