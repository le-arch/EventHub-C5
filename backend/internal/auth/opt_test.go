package auth

import (
	"testing"
	"time"
)

func TestGenerateOTP(t *testing.T) {
	// Call the function from opt.go
	code, expiry, err := GenerateOTP()

	// Check for errors
	if err != nil {
		t.Errorf("OTP generation failed: expected no error, but got %v", err)
	}

	// Verify length is exactly 6 characters
	if len(code) != 6 {
		t.Errorf("Expected code length to be 6, but got %d", len(code))
	}

	// Verify the expiration is in the future
	if expiry.Before(time.Now()) {
		t.Errorf("Security failure: expiration time is in the past")
	}
}