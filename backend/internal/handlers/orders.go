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
	"github.com/le-arch/EventHub-C5/internal/payment"
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

	// Validate ticket type existence
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket type is currently inactive"})
		return
	}
	if ticket.QuantityAvailable < int32(req.Quantity) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not enough tickets available in inventory pool"})
		return
	}

	// Dynamic validation constraint rules checkout block
	if req.Quantity != 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only single item unit volume count checkouts allowed per request processing lifecycle"})
		return
	}

	// Compute cost balances
	total := ticket.Price * int32(req.Quantity)
	const platformFeePercent = 5
	platformFee := (total * platformFeePercent) / 100

	// Generate verifiable cryptographic security patterns
	salt := uuid.New().String()
	qrHash := qrcode.GenerateQRHash(req.AttendeeName+salt, h.qrSecret)
	qrPlaintext := qrHash

	var emailPtr *string
	if req.AttendeeEmail != "" {
		emailPtr = &req.AttendeeEmail
	}

	pendingStatus := "PENDING"

	// Persist foundational structural record block natively inside repository pipeline
	order, err := h.querier.CreateOrder(c, repo.CreateOrderParams{
		EventID:         req.EventID,
		TicketTypeID:    req.TicketTypeID,
		AttendeeName:    req.AttendeeName,
		AttendeePhone:   req.AttendeePhone,
		AttendeeEmail:   emailPtr,
		Quantity:        int32(req.Quantity),
		UnitPrice:       ticket.Price,
		TotalAmount:     total,
		PaymentStatus:   &pendingStatus,
		TransactionID:   nil, // Set tracking identification string empty during initial capture phase
		QrCodeHash:      qrHash,
		QrCodePlaintext: qrPlaintext,
		QrCodeImageUrl:  "",
		DeviceInfo:      deviceInfo,
		IpAddress:       ipPtr,
		PlatformFee:     platformFee,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to seed transaction layer values: " + err.Error()})
		return
	}

<<<<<<< HEAD
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
=======
	// Initiate external billing process using your provided Payment Client definitions from cammpay.go
	campayReq := payment.PaymentRequest{
		Amount:      float64(total),
		Currency:    "XAF",
		PhoneNumber: req.AttendeePhone,
		FirstName:   req.AttendeeName,
		Email:       req.AttendeeEmail,
		ExternalID:  order.ID.String(),
		Description: "Event Registration Ticket checkout sequence processing fee",
>>>>>>> main
	}

	// Initialize the custom CamPay client explicitly to execute outgoing payments
	client := payment.NewCamPayClient()
	campayResp, err := client.RequestPayment(campayReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "campay channel payment trigger error execution: " + err.Error()})
		return
	}

	// Update tracking reference identifiers directly using your exact structural TransactionID output
	txID := campayResp.TransactionID
	_, _ = h.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: &pendingStatus,
		TransactionID: &txID,
	})

	// Async/Sync QR component build trigger mapping sequence
	qrImageURL, _ := qrcode.GenerateAndUpload(c.Request.Context(),
		order.ID.String(), req.AttendeeName, qrHash, h.MinioClient)
<<<<<<< HEAD
	if qrImageURL != "" {
    err := h.querier.UpdateOrderQRImage(c, repo.UpdateOrderQRImageParams{
        ID:             order.ID,
        QrCodeImageUrl: qrImageURL,
    })
    if err != nil {
        log.Printf("Failed to update QR image URL for order %s: %v", order.ID, err)
    }
}
=======
>>>>>>> main

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
		PaymentStatus:  pendingStatus,
		TransactionID:  &txID,
		QRCodeHash:     order.QrCodeHash,
		QRCodeImageURL: qrImageURL,
		IsUsed:         order.IsUsed,
		CreatedAt:      utils.FormatDateTime(order.CreatedAt),
	}

	c.JSON(http.StatusCreated, response)
}

func (h *EventHubHandler) handleGetOrderStatus(c *gin.Context) {
<<<<<<< HEAD
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
=======
	userID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order identification structure"})
		return
	}

	order, err := h.querier.GetOrderByID(c, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order record lookup matching identity parameters failed"})
		return
	}

	event, err := h.querier.GetEventByID(c, order.EventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "contextual entity event map parameters missing"})
		return
	}

	// Verify administrative and ownership context matching authorizations
	if event.OrganizerID != userID {
		role, _ := utils.GetUserRole(c)
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized permission access violation block execution"})
			return
		}
	}

	// Dynamically update and verify missing operational graphic generation blocks on paid entities
	if order.PaymentStatus != nil && *order.PaymentStatus == "SUCCESSFUL" && order.QrCodeImageUrl == "" {
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

	c.JSON(http.StatusOK, gin.H{
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
>>>>>>> main
}