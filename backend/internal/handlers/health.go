// health check handler
package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// HealthCheck handles the incoming container and orchestration health monitoring requests
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"message": "EventHub API is up and running smoothly",
	})
}