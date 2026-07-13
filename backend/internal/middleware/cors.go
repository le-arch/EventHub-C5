package middleware

import (
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CorsMiddleware(frontendOrigin string) gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if origin == "" {
				return true
			}
			// Allow localhost in any form
			if strings.HasPrefix(origin, "http://localhost") {
				return true
			}
			// Allow Vercel deployments
			if strings.HasSuffix(origin, "vercel.app") {
				return true
			}
			// Allow configured frontend origin
			if frontendOrigin != "" && origin == frontendOrigin {
				return true
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With", "Accept", "Accept-Language", "Cache-Control"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "X-Total-Count"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}