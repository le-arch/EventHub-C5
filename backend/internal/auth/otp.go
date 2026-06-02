/**
 * OTP Handler
 * 
 * Handles One-Time Password (OTP) generation and verification.
 * Used for email verification and password reset flows.
 * 
 * @package auth
 */

package auth

import (
	"crypto/rand"
	"errors"
	"math/big"
	"sync"
	"time"
)

// OTPConfig holds OTP configuration
type OTPConfig struct {
	Length      int           // OTP length (default: 6)
	Expiry      time.Duration // OTP expiry duration (default: 10 minutes)
	MaxAttempts int           // Maximum verification attempts (default: 3)
}

// Default OTP configuration
var DefaultOTPConfig = &OTPConfig{
	Length:      6,
	Expiry:      10 * time.Minute,
	MaxAttempts: 3,
}

// OTPRecord represents a stored OTP record
type OTPRecord struct {
	Code       string
	ExpiresAt  time.Time
	Attempts   int
	VerifiedAt *time.Time
}

// OTPHandler handles OTP operations with in-memory storage
// In production, this should use Redis or a database table
type OTPHandler struct {
	config  *OTPConfig
	storage map[string]*OTPRecord // email -> OTPRecord
	pendingUsers map[string]interface{} // email -> user data for pending verification
	resetStorage map[string]*OTPRecord // email -> OTPRecord for password reset
	mu      sync.RWMutex
}

// NewOTPHandler creates a new OTP handler instance
func NewOTPHandler(config *OTPConfig) *OTPHandler {
	if config == nil {
		config = DefaultOTPConfig
	}
	return &OTPHandler{
		config:  config,
		storage: make(map[string]*OTPRecord),
		pendingUsers: make(map[string]interface{}),
		resetStorage: make(map[string]*OTPRecord),
	}
}

func (h *OTPHandler) StoreRegistrationData(email string, data interface{}) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.pendingUsers[email] = data
}

func (h *OTPHandler) GetRegistrationData(email string) (interface{}, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	data, exists := h.pendingUsers[email]
	return data, exists
}

func (h *OTPHandler) DeleteRegistrationData(email string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.pendingUsers, email)
}

// GenerateOTP generates a new OTP for the given email
func (h *OTPHandler) GenerateOTP(email string) (string, error) {
	// Generate random numeric OTP
	code, err := h.generateRandomCode()
	if err != nil {
		return "", err
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	h.storage[email] = &OTPRecord{
		Code:      code,
		ExpiresAt: time.Now().Add(h.config.Expiry),
		Attempts:  0,
	}

	return code, nil
}

// generateRandomCode generates a random numeric code of configured length
func (h *OTPHandler) generateRandomCode() (string, error) {
	code := ""
	for i := 0; i < h.config.Length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		code += num.String()
	}
	return code, nil
}

// VerifyOTP verifies an OTP for the given email
func (h *OTPHandler) VerifyOTP(email, code string) (bool, error) {
	h.mu.Lock()
	defer h.mu.Unlock()

	record, exists := h.storage[email]
	if !exists {
		return false, errors.New("OTP not found or expired")
	}

	// Check if already verified
	if record.VerifiedAt != nil {
		return false, errors.New("OTP already used")
	}

	// Check expiry
	if time.Now().After(record.ExpiresAt) {
		delete(h.storage, email)
		return false, errors.New("OTP has expired")
	}

	// Check attempts
	if record.Attempts >= h.config.MaxAttempts {
		delete(h.storage, email)
		return false, errors.New("too many failed attempts")
	}

	record.Attempts++

	if record.Code != code {
		return false, nil
	}

	// Mark as verified
	now := time.Now()
	record.VerifiedAt = &now

	return true, nil
}

// InvalidateOTP removes an OTP record for the given email
func (h *OTPHandler) InvalidateOTP(email string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.storage, email)
}

// IsOTPVerified checks if an email has a verified OTP
func (h *OTPHandler) IsOTPVerified(email string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()

	record, exists := h.storage[email]
	if !exists {
		return false
	}
	return record.VerifiedAt != nil
}

// GetRemainingAttempts returns remaining verification attempts
func (h *OTPHandler) GetRemainingAttempts(email string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	record, exists := h.storage[email]
	if !exists {
		return 0
	}
	return h.config.MaxAttempts - record.Attempts
}

// CleanupExpiredOTPs removes expired OTP records
// Should be called periodically by a background goroutine
func (h *OTPHandler) CleanupExpiredOTPs() {
	h.mu.Lock()
	defer h.mu.Unlock()

	for email, record := range h.storage {
		if time.Now().After(record.ExpiresAt) {
			delete(h.storage, email)
		}
	}
}

// StartCleanupRoutine starts a background goroutine to clean expired OTPs
func (h *OTPHandler) StartCleanupRoutine(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		for range ticker.C {
			h.CleanupExpiredOTPs()
		}
	}()
}

func (h *OTPHandler) GenerateResetOTP(email string) (string, error) {
	// Generate random numeric OTP
	code, err := h.generateRandomCode()
	if err != nil {
		return "", err
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	h.resetStorage[email] = &OTPRecord{
		Code:      code,
		ExpiresAt: time.Now().Add(h.config.Expiry),
		Attempts:  0,
	}

	return code, nil
}

func (h *OTPHandler) VerifyResetOTP(email, code string) (bool, error) {
	h.mu.Lock()
	defer h.mu.Unlock()

	record, exists := h.resetStorage[email]
	if !exists {
		return false, errors.New("OTP not found or expired")
	}

	// Check expiry
	if time.Now().After(record.ExpiresAt) {
		delete(h.resetStorage, email)
		return false, errors.New("OTP has expired")
	}
	if record.VerifiedAt != nil {
		return false, errors.New("OTP already used")
	}

	// Check attempts
	if record.Attempts >= h.config.MaxAttempts {
		delete(h.resetStorage, email)
		return false, errors.New("too many failed attempts")
	}

	record.Attempts++

	if record.Code != code {
		return false, nil
	}

	// Mark as verified
	now := time.Now()
	record.VerifiedAt = &now

	return true, nil
}

func (h *OTPHandler) InvalidateResetOTP(email string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.resetStorage, email)
}