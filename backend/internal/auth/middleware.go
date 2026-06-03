// authentication middleware for handling JWT tokens
package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract the Authorization header from the incoming request to retrieve the JWT token for authentication and authorization purposes
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		// The expected format of the Authorization header
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid Authorization header"})
			return
		}

		// Verify the token and extract the claims to authenticate the user and authorize access to protected routes based on the token's validity and the user's permissions
		claims, err := VerifyToken(parts[1], jwtSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Store the claims in the context for use in subsequent handlers to access user information and permissions for authorization checks and personalized responses
		c.Set("user", claims)
		c.Next()
	}
	}