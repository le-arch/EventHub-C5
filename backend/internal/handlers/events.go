// event related handlers for creating, updating, and deleting events
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)


func (h *EventHubHandler) handleCreateEvent(c *gin.Context) {
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	startDate, err := utils.ParseDate(req.StartDate)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	endDate, err := utils.ParseDate(req.EndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}


	if req.Status == ""{
		req.Status = "draft"
	}
	
    salesStartDate, err := utils.ParseDate(req.SalesStartDate)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	salesEndDate, err := utils.ParseDate(req.SalesEndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	event, err := h.querier.CreateEvent(c, repo.CreateEventParams{
		OrganizerID:    req.OrganizerID,
		Title:          req.Title,
		Slug:           req.Slug,
		Description:    req.Description,
		Venue:          req.Venue,
		City:           req.City,
		StartDate:      startDate,
		EndDate:        &endDate,
		StartTime:      req.StartTime,
		EndTime:        req.EndTime,
		CoverImageUrl:  req.CoverImageUrl,
		Status:         req.Status,
		SalesStartDate: &salesStartDate,
		SalesEndDate:   &salesEndDate,
	})
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	
	response := utils.CreateEventResponse{
	ID: event.ID,
	OrganizerID: event.OrganizerID,
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
	CreatedAt: utils.FormatDateTime(event.CreatedAt),
	}

	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleGetPublicEvent(c *gin.Context) {
    eventID := c.Param("id")
    id, err := uuid.Parse(eventID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }

    event, err := h.querier.GetEventByIDPublic(c, id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "event not found or not published"})
        return
    }

    response := utils.EventResponse{
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
	CreatedAt: utils.FormatDateTime(event.CreatedAt),
	} 

    c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleUpdateEvent(c *gin.Context) {
	// claims, exists := c.Get("user")
	// id := c.Param("id")
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
	// }
	// userClaims := claims.(*auth.Claims)
	// origanizerID := userClaims.ID

	// eventID, err := uuid.Parse(id)
	// if err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
	// 	return
	// }

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

}

// Helper to convert empty string to sql.NullString (or pointer)
func nullIfEmpty(s string) *string {
    if s == "" {
        return nil
    }
    return &s
}
