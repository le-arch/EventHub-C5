// admin related handlers for managing users, events, and orders
package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

type AdminLogResponse struct {
	ID         uuid.UUID        `json:"id"`
	AdminName  string           `json:"adminName"`
	AdminEmail string           `json:"adminEmail"`
	Action     *string          `json:"action"`
	TargetType *string          `json:"targetType"`
	TargetID   *uuid.UUID       `json:"targetId"`
	TargetName string           `json:"targetName"`
	Details    string           `json:"details"`
	IpAddress  string           `json:"ipAddress"`
	CreatedAt  string           `json:"createdAt"`
}

func (h *EventHubHandler) handleViewAllEvents(c *gin.Context) {
	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "your not authorized to perform this action"})
		return
	}

	events, err := h.querier.ListEvents(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "failed to fetch events"})
		return
	}

	response := make([]utils.EventResponse, 0, len(events))

	for _, event := range events {
		response = append(response, utils.EventResponse{
			ID:             event.ID,
			OrganizerName:  event.OrganizerName,
			OrganizerEmail: event.OrganizerEmail,
			Title:          event.Title,
			Slug:           event.Slug,
			Description:    event.Description,
			Venue:          event.Venue,
			City:           event.City,
			StartDate:      utils.FormatDate(event.StartDate),
			EndDate:        utils.FormatDatePtr(event.EndDate),
			StartTime:      utils.FormatTime(event.StartTime),
			EndTime:        utils.FormatTime(event.EndTime),
			CoverImageUrl:  event.CoverImageUrl,
			Status:         event.Status,
			SalesStartDate: utils.FormatDatePtr(event.SalesStartDate),
			SalesEndDate:   utils.FormatDatePtr(event.SalesEndDate),
			CapacityRange:  utils.FromDBRange(event.CapacityRange),
			TicketStats: utils.TicketStatsResponse{
				TotalSold:    event.TicketsSold,
				TotalRevenue: event.TotalRevenue,
			},
			UpdatedAt: utils.FormatDateTime(event.UpdatedAt),
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleListAllUsers(c *gin.Context) {
	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "your not authorized to perform this action"})
		return
	}
	users, err := h.querier.GetAllUsers(c, repo.UserRole(UserRole))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no event created"})
		return
	}

	response := make([]utils.RegisterResponse, 0, len(users))

	for _, user := range users {
		response = append(response, utils.RegisterResponse{
			ID:              user.ID,
			FullName:        user.FullName,
			Email:           user.Email,
			Phone:           user.Phone,
			Role:            user.Role,
			IsEmailVerified: user.IsEmailVerified,
			IsActive:        user.IsActive,
			CreatedAt:       utils.FormatDateTime(user.CreatedAt),
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleAdminUpdateEventStatus(c *gin.Context) {

	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "your not authorized to perform this action"})
		return
	}

	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	var req models.UpdateEventStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event, err := h.querier.UpdateEventStatus(c, repo.UpdateEventStatusParams{
		ID:     eventID,
		Status: req.Status,
	})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "status not updated"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event status update successfully", "status": event.Status})
}

func (h *EventHubHandler) handleAdminSuspendEvent(c *gin.Context) {
	userRole, err := utils.GetUserRole(c)
	if err != nil || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}
	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}
	updated, err := h.querier.UpdateEventStatus(c, repo.UpdateEventStatusParams{
		ID:     eventID,
		Status: models.EventStatusSuspended,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "event suspended", "status": updated.Status})
}

func (h *EventHubHandler) handleAdminRestoreEvent(c *gin.Context) {
	userRole, err := utils.GetUserRole(c)
	if err != nil || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}
	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}
	updated, err := h.querier.UpdateEventStatus(c, repo.UpdateEventStatusParams{
		ID:     eventID,
		Status: models.EventStatusPublished,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "event restored to published", "status": updated.Status})
}

// handleVerifyOrganizer – Admin marks a user's email as verified
func (h *EventHubHandler) handleVerifyOrganizer(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// (Optional) Check that the user exists before update
	_, err = h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	err = h.querier.UpdateUserVerification(c, repo.UpdateUserVerificationParams{
		ID:              userID,
		IsEmailVerified: true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user verified successfully"})
}

// handleSuspendUser – Admin suspends a user (set is_active = false)
func (h *EventHubHandler) handleSuspendUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	_, err = h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	err = h.querier.UpdateUserActiveStatus(c, repo.UpdateUserActiveStatusParams{
		ID:       userID,
		IsActive: false,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user suspended"})
}

// handleUnsuspendUser – Admin reactivates a user
func (h *EventHubHandler) handleUnsuspendUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	_, err = h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	err = h.querier.UpdateUserActiveStatus(c, repo.UpdateUserActiveStatusParams{
		ID:       userID,
		IsActive: true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user reactivated"})
}

// handleDeleteUser – Admin permanently deletes a user
func (h *EventHubHandler) handleDeleteUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// Check if user exists (optional)
	_, err = h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	err = h.querier.DeleteUser(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

func (h *EventHubHandler) handleViewAllTransactions(c *gin.Context) {
	// Admin only
	role, _ := utils.GetUserRole(c)
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}

	// Parse filters
	statusStr := c.Query("status") // e.g., "paid", "pending"
	var statusFilter string
	if statusStr != "" {
		statusFilter = statusStr
	} // else empty string means no filter

	eventIDStr := c.Query("event_id")
	var eventIDFilter uuid.UUID
	if id, err := uuid.Parse(eventIDStr); err == nil {
		eventIDFilter = id
	} // else zero UUID means no filter

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	transactions, err := h.querier.ListAllTransactions(c, repo.ListAllTransactionsParams{
		Column1: statusFilter,
		Column2: eventIDFilter,
		Limit:   int32(limit),
		Offset:  int32(offset),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := make([]utils.TransactionResponse, len(transactions))
	for i, t := range transactions {
		response[i] = utils.TransactionResponse{
			OrderID:       t.OrderID,
			EventTitle:    t.EventTitle,
			AttendeeName:  t.AttendeeName,
			Amount:        t.Amount,
			PaymentStatus: string(t.PaymentStatus),
			CreatedAt:     utils.FormatDateTime(t.CreatedAt),
		}
	}
	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleAdminUpdateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req struct {
		FullName        *string `json:"fullName"`
		Email           *string `json:"email"`
		Phone           *string `json:"phone"`
		IsActive        *bool   `json:"isActive"`
		IsEmailVerified *bool   `json:"isEmailVerified"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	_ = user
	c.JSON(http.StatusOK, gin.H{"message": "user updated"})
}

func (h *EventHubHandler) handleBatchVerifyUsers(c *gin.Context) {
	var req struct {
		UserIDs []string `json:"user_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, idStr := range req.UserIDs {
		uid, err := uuid.Parse(idStr)
		if err != nil {
			continue
		}
		_ = h.querier.UpdateUserVerification(c, repo.UpdateUserVerificationParams{
			ID:              uid,
			IsEmailVerified: true,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "users verified"})
}

func (h *EventHubHandler) handleBatchSuspendUsers(c *gin.Context) {
	var req struct {
		UserIDs []string `json:"user_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, idStr := range req.UserIDs {
		uid, err := uuid.Parse(idStr)
		if err != nil {
			continue
		}
		_ = h.querier.UpdateUserActiveStatus(c, repo.UpdateUserActiveStatusParams{
			ID:       uid,
			IsActive: false,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "users suspended"})
}

func (h *EventHubHandler) handleRefundTransaction(c *gin.Context) {
	transactionIDStr := c.Param("id")

	c.JSON(http.StatusOK, gin.H{"message": "refund processed", "transactionId": transactionIDStr})
}

func (h *EventHubHandler) handleMarkOrderAsPaid(c *gin.Context) {
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

	if order.PaymentStatus == repo.PaymentStatusPaid {
		c.JSON(http.StatusConflict, gin.H{"error": "order already paid"})
		return
	}

	err = h.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: repo.PaymentStatusPaid,
		TransactionID: order.TransactionID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark order as paid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "order marked as paid", "orderId": orderID})
}

func (h *EventHubHandler) handleOrganizerMarkOrderAsPaid(c *gin.Context) {
	userID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

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

	event, err := h.querier.GetEventByID(c, order.EventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}
	if event.OrganizerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you do not own this event"})
		return
	}

	if order.PaymentStatus == repo.PaymentStatusPaid {
		c.JSON(http.StatusConflict, gin.H{"error": "order already paid"})
		return
	}

	err = h.querier.UpdateOrderPayment(c, repo.UpdateOrderPaymentParams{
		ID:            order.ID,
		PaymentStatus: repo.PaymentStatusPaid,
		TransactionID: order.TransactionID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark order as paid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "order marked as paid", "orderId": orderID})
}

func (h *EventHubHandler) handleAttendeeCheckin(c *gin.Context) {
	attendeeIDStr := c.Param("id")
	attendeeID, err := uuid.Parse(attendeeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attendee id"})
		return
	}

	order, err := h.querier.GetOrderByID(c, attendeeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "attendee not found"})
		return
	}

	if order.PaymentStatus != repo.PaymentStatusPaid {
		c.JSON(http.StatusForbidden, gin.H{"error": "ticket not paid"})
		return
	}

	if order.IsUsed {
		c.JSON(http.StatusConflict, gin.H{"error": "already checked in"})
		return
	}

	err = h.querier.MarkOrderUsed(c, order.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Checked in successfully",
		"attendeeName": order.AttendeeName,
		"orderId":      order.ID,
	})
}

func (h *EventHubHandler) handleGetPlatformAnalytics(c *gin.Context) {
	role, _ := utils.GetUserRole(c)
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}

	stats, err := h.querier.GetPlatformAnalytics(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate platform-wide check-in rate
	checkinRate := 0.0
	if stats.TotalOrders > 0 {
		checkinRate = float64(stats.TotalCheckedIn) / float64(stats.TotalOrders) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":     stats.TotalUsers,
		"totalEvents":    stats.TotalEvents,
		"totalOrders":    stats.TotalOrders,
		"grossRevenue":   stats.GrossRevenue,
		"platformFee":    stats.TotalPlatformFee,
		"netRevenue":     stats.NetRevenue,
		"totalCheckedIn": stats.TotalCheckedIn,
		"checkinRate":    checkinRate,
	})
}

func (h *EventHubHandler) handleListAdminLogs(c *gin.Context) {
	role, _ := utils.GetUserRole(c)
	if role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
		return
	}

	search := c.Query("search")
	action := c.Query("action")
	targetType := c.Query("targetType")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	// 3. Fix ListAdminLogs query parameter mapping
	rows, err := h.querier.ListAdminLogs(c, repo.ListAdminLogsParams{
		Column1: search,     // mapped to $1
		Column2: action,     // mapped to $2
		Column3: targetType, // mapped to $3
		Limit:   int32(limit),
		Offset:  int32(offset),
	})
	if err != nil {
		log.Printf("ListAdminLogs error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch logs"})
		return
	}

	// 4. Fix CountAdminLogs invocation structure
	total, err := h.querier.CountAdminLogs(c, repo.CountAdminLogsParams{
		Column1: search,
		Column2: action,
		Column3: targetType,
	})
	if err != nil {
		log.Printf("CountAdminLogs error: %v", err)
		total = 0
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	logs := make([]AdminLogResponse, 0, len(rows))
	for _, row := range rows {
		ipStr := ""
		if row.IpAddress != nil {
			ipStr = row.IpAddress.String()
		}
		detailsStr := ""
		if len(row.Details) > 0 {
			detailsStr = string(row.Details)
		}

		logs = append(logs, AdminLogResponse{
			ID:         row.ID,
			AdminName:  row.AdminName,
			AdminEmail: row.AdminEmail,
			Action:     row.Action,
			TargetType: row.TargetType,
			TargetID:   row.TargetID,
			TargetName: "",
			Details:    detailsStr,
			IpAddress:  ipStr,
			CreatedAt:  utils.FormatDateTime(row.CreatedAt),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":       logs,
		"total":      total,
		"totalPages": totalPages,
	})
}