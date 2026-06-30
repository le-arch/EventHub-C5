// event related handlers for creating, updating, and deleting events
package handlers

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
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

	req.OrganizerID, err = utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
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

	c.JSON(http.StatusCreated, response)
}

func (h *EventHubHandler) handleUploadImage(c *gin.Context) {
    // Authenticate user (organizer or admin)
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

    // Validate file type
    ext := filepath.Ext(file.Filename)
    allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
    if !allowed[ext] {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file type"})
        return
    }

    // Open file
    src, err := file.Open()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
        return
    }
    defer src.Close()

    // Upload to MinIO
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
		ID: id,
		OrganizerID: organizerID,
	})
	if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "no event created"})
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

func (h *EventHubHandler) handleGetOrganisationEvents(c *gin.Context) {
    OrganizerID, err := utils.ExtractOrganizerID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

    events, err := h.querier.ListOrganizerEvents(c,OrganizerID)
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

func (h *EventHubHandler) handleEventDetails(c *gin.Context) {
    eventIDStr := c.Param("id")
    eventID, err := uuid.Parse(eventIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }

    event, err := h.querier.GetEventByID(c, eventID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
        return
    }

    // Authorization: only organizer or admin
    userID, _ := utils.ExtractOrganizerID(c)
    role, _ := utils.GetUserRole(c)
    if event.OrganizerID != userID && role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
        return
    }

    response := utils.EventDetailsResponse{
        ID:             event.ID,
        OrganizerID:    event.OrganizerID,
        Title:          event.Title,
        Slug:           event.Slug,
        Description:    event.Description,
        Venue:          event.Venue,
        City:           event.City,
        StartDate:      utils.FormatDate(event.StartDate),
	    EndDate: utils.FormatDate(*event.EndDate),
	    StartTime: utils.FormatTime(event.StartTime),
	    EndTime: utils.FormatTime(event.EndTime),
        CoverImageUrl:  event.CoverImageUrl,
        Status:         string(event.Status),
        SalesStartDate: utils.FormatDate(*event.SalesStartDate),
	    SalesEndDate: utils.FormatDate(*event.SalesEndDate),
        CapacityRange:  utils.FromDBRange(event.CapacityRange),
        CreatedAt:      utils.FormatDateTime(event.CreatedAt),
        UpdatedAt:      utils.FormatDateTime(event.UpdatedAt),
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

	if req.Status == ""{
		req.Status = "draft"
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

	eventID := c.Param("id")
	id, err := uuid.Parse(eventID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }


    err = h.querier.DeleteEvent(c, repo.DeleteEventParams{
		ID: id,
		OrganizerID: organizerID,
	})
	if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "no event found"})
        return
    }

    c.JSON(http.StatusOK,gin.H{
		"message": "Event deleted successfully",
	} )
}

func (h *EventHubHandler) handlePublishEvent(c *gin.Context) {
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
    if event.Status != models.EventStatusDraft && event.Status != models.EventStatusSuspended {
        c.JSON(http.StatusBadRequest, gin.H{"error": "cannot publish from current status"})
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
    c.JSON(http.StatusOK, gin.H{"message": "event published successfully", "status": updated.Status})
}

func (h *EventHubHandler) handleUnpublishEvent(c *gin.Context) {
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
    if event.Status != models.EventStatusPublished {
        c.JSON(http.StatusBadRequest, gin.H{"error": "only published events can be unpublished"})
        return
    }
    updated, err := h.querier.UpdateEventStatus(c, repo.UpdateEventStatusParams{
        ID:     eventID,
        Status: models.EventStatusDraft,
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "event unpublished", "status": updated.Status})
}

// ticket type handlers

func (h *EventHubHandler) handleCreateTicketType(c *gin.Context) {
    eventID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }
    organizerID, err := utils.ExtractOrganizerID(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }
    event, err := h.querier.GetEventByID(c, eventID)
    if err != nil || event.OrganizerID != organizerID {
        c.JSON(http.StatusForbidden, gin.H{"error": "you do not own this event"})
        return
    }
    var req models.CreateTicketTypeRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    isActive := true
    if req.IsActive != nil {
        isActive = *req.IsActive
    }
    ticket, err := h.querier.CreateTicketType(c, repo.CreateTicketTypeParams{
        EventID:          eventID,
        Name:             req.Name,
        Description:      req.Description,
        Price:            req.Price,
        QuantityAvailable: req.QuantityAvailable,
        IsActive:         &isActive,
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

	response := utils.CreateTicketTypeResponse{
        ID:                ticket.ID,
        EventID:           ticket.EventID,
        Name:              ticket.Name,
        Description:       ticket.Description,
        Price:             ticket.Price,
        QuantityAvailable: ticket.QuantityAvailable,
        QuantitySold:      ticket.QuantitySold,
        IsActive:          ticket.IsActive,
        UpdatedAt:         utils.FormatDateTime(ticket.UpdatedAt),
		CreatedAt:			utils.FormatDateTime(ticket.CreatedAt),
    }

    c.JSON(http.StatusCreated, response)
}

func (h *EventHubHandler) handleListTicketTypes(c *gin.Context) {
    eventID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }
    tickets, err := h.querier.GetTicketTypesByEvent(c, eventID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    response := make([]utils.CreateTicketTypeResponse, len(tickets))
    for i, t := range tickets {
        response[i] = utils.CreateTicketTypeResponse{
            ID:                t.ID,
            EventID:           t.EventID,
            Name:              t.Name,
            Description:       t.Description,
            Price:             t.Price,
            QuantityAvailable: t.QuantityAvailable,
            QuantitySold:      t.QuantitySold,
            IsActive:          t.IsActive,
            UpdatedAt:         utils.FormatDateTime(t.UpdatedAt),
			CreatedAt:			utils.FormatDateTime(t.CreatedAt),
        }
    }
    c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleUpdateTicketType(c *gin.Context) {
    eventID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }
    ticketID, err := uuid.Parse(c.Param("ticket_id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ticket id"})
        return
    }
    organizerID, err := utils.ExtractOrganizerID(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }
    event, err := h.querier.GetEventByID(c, eventID)
    if err != nil || event.OrganizerID != organizerID {
        c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
        return
    }
    var req models.UpdateTicketTypeRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    params := repo.UpdateTicketTypeParams{
        ID:      ticketID,
        EventID: eventID,
        Name:    req.Name,
        Description: req.Description,
        Price:       req.Price,
        QuantityAvailable: req.QuantityAvailable,
        IsActive:    req.IsActive,
    }
    ticket, err := h.querier.UpdateTicketType(c, params)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

	response := utils.TicketTypeResponse{
        ID:                ticket.ID,
        EventID:           ticket.EventID,
        Name:              ticket.Name,
        Description:       ticket.Description,
        Price:             ticket.Price,
        QuantityAvailable: ticket.QuantityAvailable,
        QuantitySold:      ticket.QuantitySold,
        IsActive:          ticket.IsActive,
        UpdatedAt:         utils.FormatDateTime(ticket.UpdatedAt),
    }

    c.JSON(http.StatusOK, response)
}

func (h *EventHubHandler) handleDeleteTicketType(c *gin.Context) {
    eventID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
        return
    }
    ticketID, err := uuid.Parse(c.Param("ticket_id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ticket id"})
        return
    }
    organizerID, err := utils.ExtractOrganizerID(c)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }
    event, err := h.querier.GetEventByID(c, eventID)
    if err != nil || event.OrganizerID != organizerID {
        c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
        return
    }
    err = h.querier.DeleteTicketType(c, repo.DeleteTicketTypeParams{
        ID:      ticketID,
        EventID: eventID,
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "ticket type deleted succesfully"})
}

//event link
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


// Event Analytics

func (h *EventHubHandler) handleGetEventAnalytics(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

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

	stats, err := h.querier.GetEventAnalytics(c, eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch analytics"})
		return
	}

	checkinRate := 0.0
	if stats.PaidOrders > 0 {
		checkinRate = float64(stats.CheckedInCount) / float64(stats.PaidOrders) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"total_tickets_sold": stats.PaidOrders,
		"total_revenue":      stats.TotalRevenue,
		"checked_in_count":   stats.CheckedInCount,
		"checkin_rate":       checkinRate,
	})
}



