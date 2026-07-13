package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/email"
	"github.com/le-arch/EventHub-C5/internal/handlers/storage"
	"github.com/le-arch/EventHub-C5/internal/middleware"
	"github.com/le-arch/EventHub-C5/internal/payment"
)

type EventHubHandler struct {
	querier        repo.Querier
	otpHandler     *auth.OTPHandler
	revocationStore *auth.RevocationStore
	jwtSecret      string
	frontendOrigin string
	emailSender    email.Sender
	Storage        storage.Storage
	payment        *payment.WebhookHandler
	momoClient     *payment.Client
	qrSecret       string
}

func NewEventHubHandler(querier repo.Querier, otpHandler *auth.OTPHandler, revocationStore *auth.RevocationStore, jwtSecret, frontendOrigin, qrSecret string, payment *payment.WebhookHandler, imgStorage storage.Storage, momoClient *payment.Client, emailSender email.Sender) *EventHubHandler {
	return &EventHubHandler{
		querier: querier,
		otpHandler: otpHandler,
		revocationStore: revocationStore,
		jwtSecret: jwtSecret,
		frontendOrigin: frontendOrigin,
		emailSender: emailSender,
		qrSecret: qrSecret,
		Storage: imgStorage,
		payment: payment,
		momoClient: momoClient,
	}
}


func (h *EventHubHandler) WireHttpHandler() http.Handler {

	r := gin.Default()

	// Apply CORS middleware to allow requests from the frontend origin
	r.Use(middleware.CorsMiddleware(h.frontendOrigin))

	
	r.Use(middleware.RecoveryMiddleware())

	r.NoRoute(func(c *gin.Context) {
		log.Printf("404: %s %s (origin: %s)", c.Request.Method, c.Request.URL.Path, c.GetHeader("Origin"))
		c.JSON(http.StatusNotFound, gin.H{"error": "route not found"})
	})

	r.GET("/health", HealthCheck)

	// Serve uploaded files (local storage fallback)
	r.Static("/uploads", "./uploads")
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
	r.GET("/api/v1/orders/:id/details", auth.OptionalAuthMiddleware(h.jwtSecret), h.handleGetOrderDetails)

	r.GET("/api/v1/events", h.handleListPublicEvents)
	r.GET("/api/v1/events/public/:id", h.handleGetPublicEvent)
	r.GET("/api/v1/events/public/:id/ticket-types", h.handleListTicketTypes)
	r.GET("/api/v1/events/:id/ticket-types", auth.OptionalAuthMiddleware(h.jwtSecret), h.handleListTicketTypes)

	Protection := r.Group("/api/v1")
	Protection.Use(auth.AuthMiddleware(h.jwtSecret))
	{
		Protection.GET("/auth/me", h.handleGetCurrentUser)
	Protection.PUT("/auth/profile", h.handleUpdateProfile)
	Protection.POST("/auth/change-password", h.handleChangePassword)
	Protection.DELETE("/auth/account", h.handleDeleteAccount)

	Protection.POST("/events", h.handleCreateEvent)
	Protection.POST("/events/:id/ticket-types",h.handleCreateTicketType)
	Protection.POST("/checkin", h.handleCheckin)
	Protection.PUT("/orders/:id/mark-paid", h.handleOrganizerMarkOrderAsPaid)
	Protection.POST("/attendees/:id/checkin", h.handleAttendeeCheckin)

	Protection.POST("/events/upload-image", h.handleUploadImage)
	Protection.POST("/events/:id/duplicate", h.handleDuplicateEvent)

	Protection.PATCH("/events/:id", h.handleUpdateEvent)
	Protection.PATCH("/events/:id/ticket-types/:ticket_id",h.handleUpdateTicketType)
	Protection.PATCH("/events/:id/status", h.handleOrganizerUpdateEventStatus)
	Protection.PATCH("/events/:id/publish",h.handlePublishEvent)
	Protection.PATCH("/events/:id/unpublish", h.handleUnpublishEvent)
	Protection.PATCH("/admin/events/:id/status", h.handleAdminUpdateEventStatus)
	Protection.PATCH("/admin/events/:id/restore", h.handleAdminRestoreEvent)
	Protection.PUT("/admin/events/:id/cancel", h.handleAdminSuspendEvent)

	Protection.GET("/Organization/events", h.handleGetOrganisationEvents)
	Protection.GET("/Organization/:id", h.handleGetOrganisationEvent)
	Protection.GET("/events/:id/share-link", h.handleShareLink)
	Protection.GET("/orders/:id/ticket", h.handleDownloadQRCode)
	Protection.GET("/events/:id/attendees", h.handleGetAttendeeList)
	Protection.GET("/events/:id/attendees/export", h.handleExportAttendees)
	Protection.GET("/events/:id/analytics", h.handleGetEventAnalytics)
	Protection.GET("/events/:id", h.handleEventDetails)
	Protection.GET("/checkin/event/:eventId/history", h.handleGetCheckinHistory)
	Protection.GET("/admin/users", h.handleListAllUsers)
	Protection.PUT("/admin/users/:id", h.handleAdminUpdateUser)
	Protection.POST("/admin/users/batch-verify", h.handleBatchVerifyUsers)
	Protection.POST("/admin/users/batch-suspend", h.handleBatchSuspendUsers)
	Protection.GET("/admin/transactions", h.handleViewAllTransactions)
	Protection.POST("/admin/transactions/:id/refund", h.handleRefundTransaction)
	Protection.PUT("/admin/orders/:id/mark-paid", h.handleMarkOrderAsPaid)
	Protection.GET("/admin/events", h.handleViewAllEvents)
	Protection.GET("/admin/analytics", h.handleGetPlatformAnalytics)
	Protection.GET("/admin/logs", h.handleListAdminLogs)

	Protection.PUT("/admin/users/:id/verify", h.handleVerifyOrganizer)
	Protection.PUT("/admin/users/:id/suspend", h.handleSuspendUser)
	Protection.PUT("/admin/users/:id/unsuspend", h.handleUnsuspendUser)


	Protection.DELETE("/events/:id", h.handleDeleteEvent)
	Protection.DELETE("/events/:id/ticket-types/:ticket_id", h.handleDeleteTicketType)
	Protection.DELETE("/ticket-type/:id", h.handleDeleteTicketType)
	Protection.DELETE("/admin/users/:id", h.handleDeleteUser)

	
	}


	return r
}


