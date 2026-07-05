// scan to validate check-in codes for event attendance
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleCheckin(c *gin.Context) {
	var req models.CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order repo.Order
	var err error

	if req.OrderID != uuid.Nil {
		order, err = h.querier.GetOrderByID(c, req.OrderID)
	} else if req.QRHash != "" {
		order, err = h.querier.GetOrderByQRHash(c, req.QRHash)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "either qr_hash or order_id is required"})
		return
	}
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid QR code"})
		return
	}

	//  Verify payment status (only paid tickets can be checked in)
	if order.PaymentStatus != repo.PaymentStatusPaid {
		c.JSON(http.StatusForbidden, gin.H{"error": "ticket not paid"})
		return
	}


	//  Check if already used
	if order.IsUsed {
		c.JSON(http.StatusConflict, gin.H{"error": "ticket already used"})
		return
	}

	ticketType, err := h.querier.GetTicketTypeByID(c, order.TicketTypeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get ticket type"})
		return
	}

	// 5. Mark order as used
	err = h.querier.MarkOrderUsed(c, order.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Checked in successfully",
		"attendeeName":   order.AttendeeName,
		"orderId":        order.ID,
		"ticketType":     ticketType.Name,
		"checkedInAt":    time.Now().Format(time.RFC3339),
	})
}

func (h *EventHubHandler) handleGetAttendeeList(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	// Get authenticated user and check they are the organizer (or admin)
	userID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	event, err := h.querier.GetEventByID(c, eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}
	role, _ := utils.GetUserRole(c)
	if event.OrganizerID != userID && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	attendees, err := h.querier.ListAttendeesByEvent(c, eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch attendees"})
		return
	}

	response := make([]gin.H, len(attendees))
	for i, a := range attendees {
		response[i] = gin.H{
			"id":              a.ID,
			"attendeeName":    a.AttendeeName,
			"attendeePhone":   a.AttendeePhone,
			"attendeeEmail":   a.AttendeeEmail,
			"checkedIn":       a.IsUsed,
			"checkedInAt":     utils.FormatDateTime(a.UsedAt),
			"orderCreatedAt":  utils.FormatDateTime(a.CreatedAt),
		}
	}
	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleDownloadQRCode(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := h.querier.GetOrderByID(c, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	if order.QrCodeImageUrl == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "QR code not generated yet"})
		return
	}

	// Redirect to the stored MinIO URL (or proxy the image)
	c.Redirect(http.StatusFound, order.QrCodeImageUrl)
}

func (h *EventHubHandler) handleGetOrderDetails(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := h.querier.GetOrderByID(c, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	event, err := h.querier.GetEventByIDPublic(c, order.EventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	ticketType, err := h.querier.GetTicketTypeByID(c, order.TicketTypeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ticket type not found"})
		return
	}

	response := utils.TicketDetailsResponse{
		ID:            order.ID,
		AttendeeName:  order.AttendeeName,
		AttendeePhone: order.AttendeePhone,
		TicketType:    ticketType.Name,
		Quantity:      order.Quantity,
		UnitPrice:     order.UnitPrice,
		TotalAmount:   order.TotalAmount,
		EventTitle:    event.Title,
		EventDate:     utils.FormatDate(event.StartDate),
		EventTime:     utils.FormatTime(event.StartTime),
		EventVenue:    event.Venue,
		EventCity:     event.City,
		QrCodeData:    order.QrCodePlaintext,
		CreatedAt:     utils.FormatDateTime(order.CreatedAt),
	}

	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleGetCheckinHistory(c *gin.Context) {
    eventIDStr := c.Param("eventId")
    eventID, err := uuid.Parse(eventIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }

    // Auth: organizer or admin
    userID, _ := utils.ExtractOrganizerID(c)
    role, _ := utils.GetUserRole(c)
    event, err := h.querier.GetEventByID(c, eventID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
        return
    }
    if event.OrganizerID != userID && role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
        return
    }

    // Optional pagination
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
    offset := (page - 1) * limit

    history, err := h.querier.ListCheckinHistoryByEvent(c, repo.ListCheckinHistoryByEventParams{
        EventID: eventID,
        Limit:   int32(limit),
        Offset:  int32(offset),
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    response := make([]utils.CheckinHistoryResponse, len(history))
    for i, h := range history {
        response[i] = utils.CheckinHistoryResponse{
            OrderID:       h.OrderID,
            AttendeeName:  h.AttendeeName,
            AttendeePhone: h.AttendeePhone,
            TicketType:    h.TicketTypeName,
            CheckedInAt:   utils.FormatDateTime(h.UsedAt),
        }
    }
    c.JSON(http.StatusOK, response)
}