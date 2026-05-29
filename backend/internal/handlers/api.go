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
	// r.POST("/api/v1/auth/verify-otp", h.handleVerifyEmail)
	// r.POST("/api/v1/auth/login", h.handleLogin)
	// r.POST("/api/v1/auth/refresh", h.handleRefreshToken)
	// r.POST("/api/v1/auth/logout", h.handleLogout)
	// r.POST("/api/v1/auth/forgot-password", h.handleForgotPassword)
	// r.POST("/api/v1/auth/reset-password", h.handlePasswrordReset)

	// r.GET("/api/v1/auth/me", h.handleGetCurrentUser)
	
	// r.POST("/api/v1/events", h.handleCreateEvent)
	// r.POST("/api/v1/events/:id/publish",h.HandlePublicEvent)
	
	// r.GET("/api/v1/events", h.handleGetEvents)
	// r.GET("/api/v1/events/:id", h.handleEventDetails)

	// r.PUT("/api/v1/events/:id", h.handleUpdateEvent)

	// r.DELETE("/api/v1/events/:id", h.handleDeleteEvent)
	


	return r
}


