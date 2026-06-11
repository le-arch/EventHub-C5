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
	r.POST("/api/v1/auth/resend-otp", h.handleResendOTP)
	r.GET("/api/v1/events/public/:id", h.handleGetPublicEvent)

	Protection := r.Group("/api/v1")
	Protection.Use(auth.AuthMiddleware(h.jwtSecret))
	{
		Protection.GET("/auth/me", h.handleGetCurrentUser)
	
	Protection.POST("/events", h.handleCreateEvent)
	// Protection.POST("/events/:id/unpublish", h.handleUnpublishEvent)
	// Protection.POST("/events/:id/publish",h.handlePublicEvent)
	// Protection.POST("/events/:id/ticket-types",h.handleCreateTicketType)
	// Protection.POST("/orders", h.handleCreateOrder)
	// Protection.POST("/checkin", h.handleScanQRCode)
	Protection.POST("/events/:id/ticket-types", h.handleCreateEvent)

	Protection.PATCH("/events/:id", h.handleUpdateEvent)
	// Protection.PATCH("/:id/ticket-types",h.handleUpdateTicketType)

	Protection.GET("/Organization/events", h.handleGetOrganisationEvents)
	Protection.GET("/Organization/:id", h.handleGetOrganisationEvent)
	// Protection.GET("/events/:id/share-link", h.handleShareLink)
	// Protection.GET("/orders/:id/status", h.handleCheckPayementStatus)
	// Protection.GET("/orders/:id/ticket", h.handleDownloadQRCode)
	// Protection.GET("/events/:id/attendees", h.handleGetAttendeeList)
	// Protection.GET("/events/:id/analytics", h.handleGetEventAnalytics)
	Protection.PATCH("/admin/events/:id/status", h.handleGetEvents)
	Protection.GET("/admin/events", h.handleGetEvents)
	// Protection.GET("/events/:id", h.handleEventDetails)
	// Protection.GET("/checkin/event/:eventId/history", h.handleGetCheckinHistory)
	Protection.GET("/admin/users", h.handleListAllUsers)
	// Protection.GET("/admin/transactions", h.handleViewAllTransactions)
	// Protection.GET("/admin/events", h.handleViewAllEvents)

	// Protection.PUT("/admin/users/:id/verify", h.handleVerifyOrganizer)
	// Protection.PUT("/admin/users/:id/suspend", h.handleSuspendUser)

	Protection.DELETE("/events/:id", h.handleDeleteEvent)
	// Protection.DELETE("/ticket-type/:id", h.handleDeleteTicketType)
	
	}


	return r
}


