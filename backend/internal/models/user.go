// data models for user registration, login, and authentication
package models

import "github.com/le-arch/EventHub-C5/internal/db/repo"

type RegisterRequest struct {
	FullName string   `json:"full_name" binding:"required"`
	Email    string   `json:"email"    binding:"required,email"`
	Phone    string   `json:"phone"`
	Role	repo.UserRole `json:"role"`
	PasswordHash string   `json:"password_hash" binding:"required,min=6"`
}