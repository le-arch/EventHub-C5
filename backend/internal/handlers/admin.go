// admin related handlers for managing users, events, and orders
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleGetEvents(c *gin.Context) {
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
	OrganizerName: event.OrganizerName,
	Title: event.Title,
	Slug: event.Slug,
	Description: event.Description,
	Venue: event.Venue,
	City: event.City,
	StartDate: utils.FormatDate(event.StartDate),
	EndDate: utils.FormatDate(*event.EndDate),
	StartTime: utils.FormatTime(event.StartTime),
	EndTime: utils.FormatTime(event.EndTime),
	CoverImageUrl: event.CoverImageUrl,
	Status: event.Status,
	SalesStartDate: utils.FormatDate(*event.SalesStartDate),
	SalesEndDate: utils.FormatDate(*event.SalesEndDate),
	CapacityRange: utils.FromDBRange(event.CapacityRange),
	UpdatedAt: utils.FormatDateTime(event.UpdatedAt),
	})
}

	if response == nil{
		c.JSON(http.StatusUnauthorized, gin.H{"error": "reponse is empty"})
		return
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
		Role:            user.Role,
		IsEmailVerified: user.IsEmailVerified,
		CreatedAt:       utils.FormatDateTime(user.CreatedAt),
	})
}

    c.JSON(http.StatusOK, response)
}