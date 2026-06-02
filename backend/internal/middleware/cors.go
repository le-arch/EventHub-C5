//cors origin middleware configuration to allow requests from the frontend origin
package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CorsMiddleware(frontendOrigin string) gin.HandlerFunc {
// CORS middleware configuration to allow requests from the frontend origin
	return cors.New(cors.Config{
		AllowOrigins:  []string{frontendOrigin},
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        12 * time.Hour,
	})
}