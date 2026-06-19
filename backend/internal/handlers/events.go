// event related handlers for creating, updating, and deleting events
package handlers

import (
	//"context"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleCreateEvent(c *gin.Context) {
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Parsing strings to standard time objects
	parsedStartDate, err := utils.ParseDate(req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start date: " + err.Error()})
		return
	}

	var parsedEndDate time.Time
	if req.EndDate != "" {
		parsedEndDate, err = utils.ParseDate(req.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end date: " + err.Error()})
			return
		}
	}

	var salesStartDate time.Time
	if req.SalesStartDate != "" {
		salesStartDate, err = utils.ParseDate(req.SalesStartDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sales start date: " + err.Error()})
			return
		}
	}

	var salesEndDate time.Time
	if req.SalesEndDate != "" {
		salesEndDate, err = utils.ParseDate(req.SalesEndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sales end date: " + err.Error()})
			return
		}
	}

	// Default status assignment using the repo ENUM type
	if req.Status == "" {
		req.Status = repo.EventStatusDraft
	}

	// Prepare raw pgtype bindings for SQLC parameters
	startTimeStr := ""
	if req.StartTime != nil {
		startTimeStr = *req.StartTime
	}
	endTimeStr := ""
	if req.EndTime != nil {
		endTimeStr = *req.EndTime
	}

	// Map complex pgtype elements safely
	dbCapacity := pgtype.Range[pgtype.Int4]{Valid: false}
	if req.CapacityRange != nil {
		dbCapacity = pgtype.Range[pgtype.Int4]{
			Lower: pgtype.Int4{Int32: req.CapacityRange.Lower, Valid: true},
			Upper: pgtype.Int4{Int32: req.CapacityRange.Upper, Valid: true},
			Valid: true,
		}
	}

	event, err := h.querier.CreateEvent(c, repo.CreateEventParams{
		OrganizerID:    organizerID,
		Title:          req.Title,
		Slug:           req.Slug,
		Description:    req.Description,
		VenueName:      req.VenueAddress, // Using layout binding map property
		City:           req.City,
		StartDate:      pgtype.Date{Time: parsedStartDate, Valid: true},
		EndDate:        parsedEndDate,
		StartTime:      pgtype.Time{Microseconds: parseTimeToMicroseconds(startTimeStr), Valid: true},
		EndTime:        pgtype.Time{Microseconds: parseTimeToMicroseconds(endTimeStr), Valid: true},
		CoverImageUrl:  req.CoverImageUrl,
		Status:         req.Status,
		SalesStartDate: salesStartDate,
		SalesEndDate:   salesEndDate,
		CapacityRange:  dbCapacity,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, event)
}

func (h *EventHubHandler) handleUploadImage(c *gin.Context) {
	_, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required"})
		return
	}

	ext := filepath.Ext(file.Filename)
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file type"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer src.Close()

	url, err := h.MinioClient.UploadEventImage(src, file)
	if err != nil {
		log.Printf("MinIO upload error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}

func (h *EventHubHandler) handleGetOrganisationEvent(c *gin.Context) {
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	eventID := c.Param("id")
	id, err := uuid.Parse(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	event, err := h.querier.ListOrganizerEvent(c, repo.ListOrganizerEventParams{
		ID:          id,
		OrganizerID: organizerID,
	})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no event found matching identification parameters"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func (h *EventHubHandler) handleGetOrganisationEvents(c *gin.Context) {
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	events, err := h.querier.ListOrganizerEvents(c, organizerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no events created"})
		return
	}

	c.JSON(http.StatusOK, events)
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

	c.JSON(http.StatusOK, event)
}

func (h *EventHubHandler) handleUpdateEvent(c *gin.Context) {
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	var req models.UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event, err := h.querier.GetEventByID(c, eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}
	if event.OrganizerID != organizerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you do not have permission to modify this event"})
		return
	}

	// Implement PartialUpdate matching criteria using positional assignment modifications
	titleVal := event.Title
	if req.Title != nil {
		titleVal = *req.Title
	}
	venueVal := event.VenueName
	if req.VenueAddress != nil {
		venueVal = *req.VenueAddress
	}

	updatedEvent, err := h.querier.UpdateEvent(c, repo.UpdateEventParams{
		ID:            event.ID,
		Title:         titleVal,
		Slug:          event.Slug,
		Description:   req.Description,
		VenueName:     venueVal,
		City:          event.City,
		StartDate:     event.StartDate,
		EndDate:       event.EndDate,
		StartTime:     event.StartTime,
		EndTime:       event.EndTime,
		CoverImageUrl: req.CoverImageUrl,
		Status:        event.Status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update execution path: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedEvent)
}

func (h *EventHubHandler) handleOrganizerUpdateEventStatus(c *gin.Context) {
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}
	event, err := h.querier.GetEventByID(c, eventID)
	if err != nil || event.OrganizerID != organizerID {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return
	}

	var req models.UpdateEventStatus
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.querier.UpdateEventStatus(c, repo.UpdateEventStatusParams{
		ID:     eventID,
		Status: req.Status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "event status updated", "status": updated.Status})
}

func (h *EventHubHandler) handleDeleteEvent(c *gin.Context) {
	organizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	err = h.querier.DeleteEvent(c, repo.DeleteEventParams{
		ID:          id,
		OrganizerID: organizerID,
	})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no event found to drop"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

func (h *EventHubHandler) handleShareLink(c *gin.Context) {
	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	_, err = h.querier.GetEventByIDPublic(c, eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found or not published"})
		return
	}

	link := fmt.Sprintf("%s/events/%s", h.frontendOrigin, eventID)
	c.JSON(http.StatusOK, gin.H{"share_link": link})
}

// Internal formatting utility helper to translate hour strings into Postgres time representation
func parseTimeToMicroseconds(timeStr string) int64 {
	if timeStr == "" {
		return 0
	}
	t, err := time.Parse("15:04", timeStr)
	if err != nil {
		t, err = time.Parse("15:04:05", timeStr)
		if err != nil {
			return 0
		}
	}
	return int64(t.Hour()*3600+t.Minute()*60+t.Second()) * 1000000
}