// order related handlers for creating, updating, and deleting orders
package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/models"
)

// Global regular expression pattern to validate ticket-buyer names.
// Restricts characters strictly to letters, spaces, hyphens, and apostrophes.
var attendeeNameRegex = regexp.MustCompile(`^[a-zA-Z\s\-']+$`)

// HandleCreateOrder processes ticket checkout validations before order creation.
func (h *EventHubHandler) HandleCreateOrder(c *gin.Context) {
	var req models.CreateOrderRequest

	// 1. Perform structural JSON schema binding validation
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Constraint validation: Check for empty string field values or short values
	if len(strings.TrimSpace(req.FullName)) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be at least 2 characters long"})
		return
	}

	// 3. Regular Expression validation: Reject names containing digits or invalid punctuation characters
	if !attendeeNameRegex.MatchString(req.FullName) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name can only contain letters, spaces, hyphens, or apostrophes"})
		return
	}

	// Validation successful! (Database persistence layer handling logic goes here later)
	c.JSON(http.StatusOK, gin.H{
		"message":   "Validation passed successfully",
		"full_name": req.FullName,
	})
}