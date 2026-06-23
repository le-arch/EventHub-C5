// admin related handlers for managing users, events, and orders
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleGetEvents(c *gin.Context) {
	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "you are not authorized to perform this action"})
		return
	}

	events, err := h.querier.ListEvents(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

func (h *EventHubHandler) handleListAllUsers(c *gin.Context) {
	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "you are not authorized to perform this action"})
		return
	}

	// Adjust mapping if your internal schema relies on an explicit enum constructor mapping
	users, err := h.querier.GetAllUsers(c, repo.UserRole(UserRole))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "failed to fetch system users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *EventHubHandler) handleAdminUpdateEventStatus(c *gin.Context) {
	UserRole, err := utils.GetUserRole(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if UserRole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "you are not authorized to perform this action"})
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

	c.JSON(http.StatusOK, gin.H{"message": "event status updated successfully", "status": event.Status})
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
		Status: repo.EventStatusSuspended, // Using standard repo enum mapping instead of string constant pointers
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
		Status: repo.EventStatusPublished, // Aligned directly with SQLC generated definitions
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "event restored to published", "status": updated.Status})
}