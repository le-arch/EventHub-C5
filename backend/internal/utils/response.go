// utility functions for standardizing API responses and error handling
package utils


// RegisterResponse defines the structure of the response sent back to the client after a successful registration
type RegisterResponse struct {
	ID string `json:"id"`
	FullName string `json:"full_name"`
	Email string `json:"email"`
	Role string `json:"role"`
	IsEmailVerified *bool  `json:"is_email_verified"`
	CreatedAt  string `json:"created_at"`
}