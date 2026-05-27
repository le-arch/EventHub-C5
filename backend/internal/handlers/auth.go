// authentication related handlers for user registration, login, email verification, and password reset

package handlers

import (
	"net/http"

	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/gin-gonic/gin"
)

func (h *EventHubHandler) handleCreateUser(c *gin.Context) {
	var req repo.CreateUserParams
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.querier.CreateUser(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}