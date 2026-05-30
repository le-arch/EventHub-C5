// data models for user registration, login, and authentication
package models

type RegisterRequest struct {
	FullName string   `json:"full_name" binding:"required"`
	Email    string   `json:"email"    binding:"required,email"`
	Phone    string   `json:"phone"`
	Role	string `json:"role"`
	PasswordHash string   `json:"password_hash" binding:"required,min=6"`
}