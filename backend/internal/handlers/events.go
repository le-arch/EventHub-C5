// event related handlers for creating, updating, and deleting events
package handlers



import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

// HandleCreateEvent receives client payloads and evaluates validation rules before database ingestion
func (h *EventHubHandler) HandleCreateEvent(c *gin.Context) {
	var input utils.CreateEventInput

	// Step A: Parse JSON body payload
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body format"})
		return
	}

	// Step B: Fire our new custom validator rules
	if err := utils.ValidateCreateEvent(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Step C: Success Response (Database Mock hook for test framework verification)
	c.JSON(http.StatusCreated, gin.H{"message": "Event validated and created successfully", "title": input.Title})
}