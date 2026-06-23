package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/handlers/storage"
	"github.com/le-arch/EventHub-C5/internal/middleware"
	"github.com/le-arch/EventHub-C5/internal/payment"
)

 type EventHubHandler struct {
	querier repo.Querier
	otpHandler *auth.OTPHandler
	revocationStore *auth.RevocationStore
	jwtSecret string
	frontendOrigin string
	gmailUser string
	gmailPassword string
	MinioClient *storage.MinioClient
	payment *payment.WebhookHandler
	momoClient *payment.Client
	qrSecret	string
}

func NewEventHubHandler(querier repo.Querier, otpHandler *auth.OTPHandler, revocationStore *auth.RevocationStore, jwtSecret, frontendOrigin, gmailUser, gmailPassword, qrSecret string,  payment *payment.WebhookHandler,  minioClient *storage.MinioClient, momoClient *payment.Client ) *EventHubHandler {
	return &EventHubHandler{
		querier: querier,
		otpHandler: otpHandler,
		revocationStore: revocationStore,
		jwtSecret: jwtSecret,
		frontendOrigin: frontendOrigin,
		gmailUser: gmailUser,
		gmailPassword: gmailPassword,
		qrSecret: qrSecret,
		MinioClient: minioClient,
		payment: payment,
		momoClient: momoClient,
	}
}


func (h *EventHubHandler) WireHttpHandler() http.Handler {

	r := gin.Default()

	// Apply CORS middleware to allow requests from the frontend origin
	r.Use(middleware.CorsMiddleware(h.frontendOrigin))

	
	r.Use(middleware.RecoveryMiddleware())

	r.GET("/health", HealthCheck)
	r.POST("/api/v1/auth/register", h.handleRegister)
	r.POST("/api/v1/auth/verify-otp", h.handleVerifyEmail)
	r.POST("/api/v1/auth/login", h.handleLogin)
	r.POST("/api/v1/auth/refresh", h.handleRefreshToken)
	r.POST("/api/v1/auth/logout", h.handleLogout)
	r.POST("/api/v1/auth/forgot-password", h.handleForgotPassword)
	r.POST("/api/v1/auth/reset-password", h.handlePasswrordReset)
	r.POST("/api/v1/auth/resend-otp", h.handleResendOTP)
	r.POST("/api/v1/orders", h.handleCreateOrder)
	r.POST("/api/v1/webhooks/momo", h.payment.HandleMomoWebhook)

	// Public routes (no auth required, but optional JWT parsing)
	r.GET("/api/v1/orders/:id/status", auth.OptionalAuthMiddleware(h.jwtSecret), h.handleGetOrderStatus)
	
	r.GET("/api/v1/events/public/:id", h.handleGetPublicEvent)

	Protection := r.Group("/api/v1")
	Protection.Use(auth.AuthMiddleware(h.jwtSecret))
	{
		Protection.GET("/auth/me", h.handleGetCurrentUser)
	
	Protection.POST("/events", h.handleCreateEvent)
	Protection.POST("/events/:id/ticket-types",h.handleCreateTicketType)
	
	// Protection.POST("/checkin", h.handleScanQRCode)
	Protection.POST("events/upload-image", h.handleUploadImage)

	Protection.PATCH("/events/:id", h.handleUpdateEvent)
	Protection.PATCH("/:id/ticket-types",h.handleUpdateTicketType)
	Protection.PATCH("events/:id/status", h.handleOrganizerUpdateEventStatus)
	Protection.PATCH("/events/:id/publish",h.handlePublishEvent)
	Protection.PATCH("/events/:id/unpublish", h.handleUnpublishEvent)
	Protection.PATCH("/admin/events/:id/status", h.handleAdminUpdateEventStatus)
	Protection.PATCH("/admin/events/:id/restore", h.handleAdminRestoreEvent)

	Protection.GET("/Organization/events", h.handleGetOrganisationEvents)
	Protection.GET("/Organization/:id", h.handleGetOrganisationEvent)
	Protection.GET("/events/:id/share-link", h.handleShareLink)
	// Protection.GET("/orders/:id/status", h.handleCheckPayementStatus)
	// Protection.GET("/orders/:id/ticket", h.handleDownloadQRCode)
	// Protection.GET("/events/:id/attendees", h.handleGetAttendeeList)
	// Protection.GET("/events/:id/analytics", h.handleGetEventAnalytics)
	Protection.GET("/admin/events", h.handleGetEvents)
	// Protection.GET("/events/:id", h.handleEventDetails)
	// Protection.GET("/checkin/event/:eventId/history", h.handleGetCheckinHistory)
	Protection.GET("/events/:id/ticket-types", h.handleListTicketTypes)
	Protection.GET("/admin/users", h.handleListAllUsers)
	// Protection.GET("/admin/transactions", h.handleViewAllTransactions)
	// Protection.GET("/admin/events", h.handleViewAllEvents)

	// Protection.PUT("/admin/users/:id/verify", h.handleVerifyOrganizer)

	Protection.DELETE("/events/:id", h.handleDeleteEvent)
	Protection.DELETE("/ticket-type/:id", h.handleDeleteTicketType)
	
	}


	return r
}


