package handlers

import (
	"net/http"

	"github.com/le-arch/EventHub-C5/internal/db/repo"
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

	r.POST("/api/v1/auth/register", h.handleRegister)

	return r
}


