// Package handlers implements the HTTP routing and controller layer.
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// handleHealthCheck returns a simple JSON status object to confirm the API is online.
// It can be extended later to ping h.querier or h.MinioClient if deeper health checks are needed.
func (h *EventHubHandler) handleHealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"message": "EventHub API is operating within normal parameters",
	})
}