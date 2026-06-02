package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/middleware"
)

 type EventHubHandler struct {
	querier repo.Querier
	otpHandler *auth.OTPHandler
	revocationStore *auth.RevocationStore
	jwtSecret string
	frontendOrigin string
	gmailUser string
	gmailPassword string
}

func NewEventHubHandler(querier repo.Querier, otpHandler *auth.OTPHandler, revocationStore *auth.RevocationStore, jwtSecret, frontendOrigin, gmailUser, gmailPassword string) *EventHubHandler {
	return &EventHubHandler{
		querier: querier,
		otpHandler: otpHandler,
		revocationStore: revocationStore,
		jwtSecret: jwtSecret,
		frontendOrigin: frontendOrigin,
		gmailUser: gmailUser,
		gmailPassword: gmailPassword,
	}
}

func (h *EventHubHandler) WireHttpHandler() http.Handler {

	r := gin.Default()

	// Apply CORS middleware to allow requests from the frontend origin
	r.Use(middleware.CorsMiddleware(h.frontendOrigin))

	
	r.Use(middleware.RecoveryMiddleware())


	r.POST("/api/v1/auth/register", h.handleRegister)
	r.POST("/api/v1/auth/verify-otp", h.handleVerifyEmail)
	r.POST("/api/v1/auth/login", h.handleLogin)
	r.POST("/api/v1/auth/refresh", h.handleRefreshToken)
	r.POST("/api/v1/auth/logout", h.handleLogout)
	r.POST("/api/v1/auth/forgot-password", h.handleForgotPassword)
	r.POST("/api/v1/auth/reset-password", h.handlePasswrordReset)

	Protection := r.Group("/api/v1")
	Protection.Use(auth.AuthMiddleware(h.jwtSecret))
	{
		Protection.GET("/auth/me", h.handleGetCurrentUser)
	
	// Protection.POST("/events", h.handleCreateEvent)
	// Protection.POST("/events/:id/publish",h.HandlePublicEvent)
	
	// Protection.GET("/events", h.handleGetEvents)
	// Protection.GET("/events/:id", h.handleEventDetails)

	// Protection.PUT("/events/:id", h.handleUpdateEvent)

	// Protection.DELETE("/events/:id", h.handleDeleteEvent)
	}


	return r
}


