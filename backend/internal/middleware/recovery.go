// This file contains the recovery middleware for the EventHub API.
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware is a middleware function that recovers from any panics and returns a 500 Internal Server Error response.
func RecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, _ any) {
		c.String(http.StatusInternalServerError, "Internal Server Error: panic")
		c.AbortWithStatus(http.StatusInternalServerError)
	})
}