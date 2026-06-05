// cors origin middleware configuration to allow requests from the frontend origin
package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CorsMiddleware(frontendOrigin string) gin.HandlerFunc {
	// CORS middleware configuration to allow requests from the frontend origin
	// This enables secure cross-origin communication between frontend and backend
	// Supports both local development (localhost) and GitHub Codespace domains
	
	allowedOrigins := []string{
		frontendOrigin,
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:5173",
	
	}
	
	return cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With", "Accept", "Accept-Language", "Cache-Control"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "X-Total-Count"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}