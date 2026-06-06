// pulls authenticated user's id from jwt claime set by Auth middleware
package utils

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
)

type AuthHelper struct {
	querier repo.Querier
}


func ExtractOrganizerID (c *gin.Context) (uuid.UUID, error){
	userIDVal, exists := c.Get("user")
	if !exists {
		return uuid.Nil, errors.New("unauthorized: missing user identity")
	}
	claims, ok := userIDVal.(*auth.Claims)
	if !ok {
		return uuid.Nil, errors.New("unauthorized: malformed user identity")
	}
	return claims.ID, nil
}

func (h *AuthHelper) IsEventOwner (c *gin.Context, eventID uuid.UUID, organizerID uuid.UUID) (repo.Event, bool) {
	event, err := h.querier.GetEventByID(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event not found"})
		return repo.Event{}, false
	}
	if event.OrganizerID != organizerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you do not have permission to modify this event"})
		return repo.Event{}, false
	}
	return event, true
}