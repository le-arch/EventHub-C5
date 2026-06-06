// event related handlers for creating, updating, and deleting events
package handlers

import (
	"net/http"
	"time"

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
		CapacityRange: utils.ToDBRange(req.CapacityRange),
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
	CapacityRange: utils.FromDBRange(event.CapacityRange),
	CreatedAt: utils.FormatDateTime(event.CreatedAt),
	}

	c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleGetEvents(c *gin.Context) {
    
    events, err := h.querier.ListEvents(c)
	    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "no event created"})
        return
    }

	response := make([]utils.EventResponse, 0, len(events))
	
	for _, event := range events {
	response = append(response, utils.EventResponse{
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
	CapacityRange: utils.FromDBRange(event.CapacityRange),
	UpdatedAt: utils.FormatDateTime(event.UpdatedAt),
	} 

    c.JSON(http.StatusOK, response)
}

// parseDatePtr converts a *string date (YYYY-MM-DD) to *time.Time.
// Returns nil if the input is nil or empty.
func parseDatePtr(s *string) *time.Time {
    if s == nil || *s == "" {
        return nil
    }
    t, err := utils.ParseDate(*s)
    if err != nil {
        return nil
    }
    return &t
}

func (h *EventHubHandler) handleUpdateEvent(c *gin.Context) {
	// Get authenticated organizer id
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// parse event id from url
	eventIDParam := c.Param("id")
	eventID, err := uuid.Parse(eventIDParam)
	if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// verify event exists and belongs to organizer
	event, err := h.querier.GetEventByID(c, eventID)
	if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
        return
    }
    if event.OrganizerID != organizerID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you do not have permission to modify this event"})
        return
    }

	eventUpdate := repo.PartialEventUpdateParams{
		ID:          eventID,
        OrganizerID: organizerID,
        Title:       req.Title,
        Slug:        req.Slug,
        Description: req.Description,
        Venue:       req.Venue,
        City:        req.City,
        StartTime:   req.StartTime,
        EndTime:     req.EndTime,
        CoverImageUrl: req.CoverImageUrl,
        Status:      req.Status,
        StartDate:   parseDatePtr(req.StartDate),
        EndDate:     parseDatePtr(req.EndDate),
        SalesStartDate: parseDatePtr(req.SalesStartDate),
        SalesEndDate:   parseDatePtr(req.SalesEndDate),
	}

	if req.StartTime != nil && *req.StartTime != "" {
    eventUpdate.StartTime = req.StartTime
	}
	if req.EndTime != nil && *req.EndTime != "" {
		eventUpdate.EndTime = req.EndTime
	}

	 if req.CapacityRange != nil {
        dbRange := utils.ToDBRange(req.CapacityRange)
        eventUpdate.CapacityRange = dbRange
    } else {
        eventUpdate.CapacityRange = nil
    }

	updatedEvent, err := h.querier.PartialEventUpdate(c, eventUpdate)
	if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update event: " + err.Error()})
        return
    }

	response := utils.EventResponse{
		Title: updatedEvent.Title,
		Slug:  updatedEvent.Slug,
		Description: updatedEvent.Description,
		Venue: updatedEvent.Venue,
		City: updatedEvent.City,
		StartDate: utils.FormatDate(updatedEvent.StartDate),
		EndDate: utils.FormatDate(*updatedEvent.EndDate),
		StartTime: utils.FormatTime(updatedEvent.StartTime),
		EndTime: utils.FormatTime(updatedEvent.EndTime),
		CoverImageUrl: updatedEvent.CoverImageUrl,
		Status: updatedEvent.Status,
		SalesStartDate: utils.FormatDate(*updatedEvent.SalesStartDate),
		SalesEndDate: utils.FormatDate(*updatedEvent.SalesEndDate),
		CapacityRange: utils.FromDBRange(event.CapacityRange),
		UpdatedAt: utils.FormatDateTime(updatedEvent.UpdatedAt),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event updated successfully",
		"eventDetails": response,
	})
}



