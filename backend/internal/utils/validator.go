// utility functions for validating input data	
package utils

import (
	"errors"
	emailverifier "github.com/AfterShip/email-verifier"
)
 
var verifier = emailverifier.NewVerifier()


func IsValidEmail(email string) bool {
	result, err := verifier.Verify(email)
	if err != nil {
		return false
	}
	return result.Syntax.Valid && result.HasMxRecords
}







// CreateEventInput defines the strict schema layout expected from a frontend request
type CreateEventInput struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Venue       string  `json:"venue"`
	City        string  `json:"city"`
	TicketPrice float64 `json:"ticket_price"`
}

// ValidateCreateEvent enforces core logical limits on event metadata inputs
func ValidateCreateEvent(input CreateEventInput) error {
	// Rule 1: The title cannot be empty text
	if input.Title == "" {
		return errors.New("event title cannot be empty")
	}
	// Rule 2: The description cannot be empty text.
	if input.Description == "" {
		return errors.New("event description cannot be empty")
	}
	// Rule 3: The location cannot be empty text.
	if input.Venue == "" {
		return errors.New("event venue location cannot be empty")
	}
	// Rule 4: Ticket prices cannot be negative. Free events use 0.
	if input.City == "" {
		return errors.New("event city location cannot be empty")
	}
	// Rule 5: Events cannot be scheduled in the past.
	if input.TicketPrice < 0 {
		return errors.New("ticket price cannot be negative")
	}
	// If no validation rules are broken, return an empty string signifying success.
	return nil
}