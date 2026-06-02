package auth

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
)

// GenerateOTP creates a secure 6-digit number string and a 10-minute expiration time.
func GenerateOTP() (string, time.Time, error) {
	// Define the 10-minute expiration duration
	expiryTime := time.Now().Add(10 * time.Minute)

	// Generate a secure random number between 000000 and 999999
	maxLimit := big.NewInt(1000000)
	secureNumber, err := rand.Int(rand.Reader, maxLimit)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("failed to generate secure random number: %w", err)
	}

	// Format the number to always be exactly 6 characters with leading zeros
	otpCode := fmt.Sprintf("%06d", secureNumber.Int64())

	return otpCode, expiryTime, nil
}