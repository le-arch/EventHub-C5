// cors origin middleware configuration to allow requests from the frontend origin
package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CorsMiddleware(frontendOrigin string) gin.HandlerFunc {
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:3002",
		"http://localhost:5173",
		"https://event-hub-c5.vercel.app",
	}
	if frontendOrigin != "" {
		// Avoid duplicates
		dup := false
		for _, o := range allowedOrigins {
			if o == frontendOrigin {
				dup = true
				break
			}
		}
		if !dup {
			allowedOrigins = append(allowedOrigins, frontendOrigin)
		}
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