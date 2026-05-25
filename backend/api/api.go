package api

import (
	"net/http"

	"github.com/Iknite-Space/sqlc-example-api/db/repo"
	"github.com/gin-gonic/gin"
)

type EventHubHandler struct {
	querier repo.Querier
}

func NewEventHubHandler(querier repo.Querier) *EventHubHandler {
	return &EventHubHandler{
		querier: querier,
	}
}

func (h *EventHubHandler) WireHttpHandler() http.Handler {

	r := gin.Default()
	r.Use(gin.CustomRecovery(func(c *gin.Context, _ any) {
		c.String(http.StatusInternalServerError, "Internal Server Error: panic")
		c.AbortWithStatus(http.StatusInternalServerError)
	}))

	r.POST("/user", h.handleCreateUser)

	return r
}

func (h *EventHubHandler) handleCreateUser(c *gin.Context) {
	var req repo.CreateUserParams
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message, err := h.querier.CreateUser(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, message)
}
