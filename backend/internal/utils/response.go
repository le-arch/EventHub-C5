// utility functions for standardizing API responses and error handling
package utils

import "github.com/le-arch/EventHub-C5/internal/db/repo"

// RegisterResponse defines the structure of the response sent back to the client after a successful registration
type RegisterResponse struct {
	ID string `json:"id"`
	FullName string `json:"full_name"`
	Email string `json:"email"`
	Role repo.UserRole `json:"role"`
	IsEmailVerified *bool  `json:"is_email_verified"`
	CreatedAt  string `json:"created_at"`
}