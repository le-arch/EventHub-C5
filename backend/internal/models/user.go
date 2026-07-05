// data models for user registration, login, and authentication
package models

type RegisterRequest struct {
	FullName     string `json:"full_name" binding:"required"`
	Email        string `json:"email"    binding:"required,email"`
	Phone        string `json:"phone"`
	PasswordHash string `json:"password_hash" binding:"required,min=6"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	Otp   string `json:"otp" binding:"required,len=6"`
}

type LoginRequest struct {
	Email        string `json:"email" binding:"required,email"`
	PasswordHash string `json:"password_hash" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UserRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Email        string `json:"email" binding:"required,email"`
	Otp          string `json:"otp" binding:"required,len=6"`
	PasswordHash string `json:"password_hash" binding:"required,min=6"`
}
