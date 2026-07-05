// admin related handlers for managing users, events, and orders
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

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

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")
	statusFilter := c.DefaultQuery("status", "")
	offset := (page - 1) * limit

	totalCount, err := h.querier.CountEventsAdmin(c, statusFilter, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count events"})
		return
	}

	events, err := h.querier.ListEventsAdmin(c, statusFilter, search, int32(limit), int32(offset))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "failed to fetch events"})
		return
	}

	response := make([]utils.EventResponse, 0, len(events))
	for _, event := range events {
		response = append(response, utils.EventResponse{
			ID:             event.ID,
			OrganizerID:    event.OrganizerID,
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
			TicketStats:    utils.TicketStatsResponse{},
			UpdatedAt:      utils.FormatDateTime(event.UpdatedAt),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"events": response,
		"total":  totalCount,
		"page":   page,
		"limit":  limit,
	})
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
    users, err := h.querier.GetAllUsersForAdmin(c)
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
		IsEmailVerified:     user.IsEmailVerified,
		IsOrganizerVerified: user.IsOrganizerVerified,
		IsActive:            user.IsActive,
		EventsCount:         user.EventsCount,
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
		ID: eventID,
		Status: req.Status,
	})
	if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "status not updated"})
        return
    }

	

    c.JSON(http.StatusOK,gin.H{"message": "event status update successfully", "status": event.Status})
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

// handleVerifyOrganizer – Admin approves an organizer account
func (h *EventHubHandler) handleVerifyOrganizer(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// Check that the user exists before update
	_, err = h.querier.GetUserByIDForAdmin(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	err = h.querier.UpdateOrganizerVerification(c, repo.UpdateOrganizerVerificationParams{
		ID:                  userID,
		IsOrganizerVerified: true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "organizer verified successfully"})
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
		ID:        userID,
		IsActive:  false,
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
		ID:        userID,
		IsActive:  true,
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

// handleBatchVerifyOrganizer – Admin verifies multiple organizers at once
func (h *EventHubHandler) handleBatchVerifyOrganizer(c *gin.Context) {
	var req struct {
		UserIDs []string `json:"userIds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	for _, idStr := range req.UserIDs {
		userID, err := uuid.Parse(idStr)
		if err != nil {
			continue
		}
		_ = h.querier.UpdateOrganizerVerification(c, repo.UpdateOrganizerVerificationParams{
			ID:                  userID,
			IsOrganizerVerified: true,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "organizers verified successfully"})
}

// handleBatchSuspendUser – Admin suspends multiple users at once
func (h *EventHubHandler) handleBatchSuspendUser(c *gin.Context) {
	var req struct {
		UserIDs []string `json:"userIds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	for _, idStr := range req.UserIDs {
		userID, err := uuid.Parse(idStr)
		if err != nil {
			continue
		}
		_ = h.querier.UpdateUserActiveStatus(c, repo.UpdateUserActiveStatusParams{
			ID:       userID,
			IsActive: false,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "users suspended successfully"})
}

// handleAdminCancelEvent – Admin cancels an event
func (h *EventHubHandler) handleAdminCancelEvent(c *gin.Context) {
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
		Status: models.EventStatusCancelled,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event cancelled successfully", "status": updated.Status})
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
        "totalUsers":       stats.TotalUsers,
        "totalEvents":      stats.TotalEvents,
        "totalOrders":      stats.TotalOrders,
        "grossRevenue":     stats.GrossRevenue,
        "platformFee":      stats.TotalPlatformFee,
        "netRevenue":       stats.NetRevenue,
        "totalCheckedIn":   stats.TotalCheckedIn,
        "checkinRate":      checkinRate,
    })
}