// utility functions for validating input data	
package utils

import (
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

