// authentication related handlers for user registration, login, email verification, and password reset

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
	"github.com/le-arch/EventHub-C5/internal/email"
	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

func (h *EventHubHandler) handleRegister(c *gin.Context) {
	//bind the incoming JSON request to the RegisterRequest struct
	var req models.RegisterRequest
	err := c.ShouldBindBodyWithJSON(&req)
	//handle any errors that occur during binding
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//validate email address using the utility function before proceeding with user creation
	IsEmailValid := utils.IsValidEmail(req.Email)
	if !IsEmailValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	//check if the email already exists in the database to prevent duplicate registrations
	_, err = h.querier.GetUserByEmail(c, req.Email)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}
	//hash the password before storing it in the database
	var hashedPassword, e = auth.HashPassword(req.PasswordHash)
	if e != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to hash password"})
		return
	}

	if req.Role == "" {
		req.Role = "organizer" // default role if not provided
	}

	PendingData := map[string]interface{}{
		"full_name":         req.FullName,
		"email":             req.Email,
		"phone":             req.Phone,
		"role":              req.Role,
		"password_hash":     hashedPassword,
		"is_email_verified": false,
	}

	err = h.otpHandler.SendOtpEmail(h.gmailUser, h.gmailPassword, req.Email, "", PendingData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP email"})
		return
	}

	//send the response back to the client
	c.JSON(http.StatusOK, gin.H{"message": "verify your email to complete registration"})
}

func (h *EventHubHandler) handleVerifyEmail(c *gin.Context) {
	var req models.VerifyEmailRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pendingData, ok, err := h.otpHandler.VerifyEmail(h.gmailUser, h.gmailPassword, req.Email, req.Otp)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired OTP"})
		return
	}

	pendingMap, ok := pendingData.(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process pending registration data"})
		return
	}

	roleVal, ok := pendingMap["role"].(repo.UserRole)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid role type in pending data"})
		return
	}

	verified := true

	//create the user in the database
	user, err := h.querier.CreateUser(c, repo.CreateUserParams{
		Email:           pendingMap["email"].(string),
		Phone:           pendingMap["phone"].(string),
		Role:            roleVal,
		PasswordHash:    pendingMap["password_hash"].(string),
		FullName:        pendingMap["full_name"].(string),
		IsEmailVerified: &verified,
	})
	//handle any errors that occur during user creation
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	// Generate a JWT token for the newly registered user
	token, err := auth.CreateToken(
		user.ID,
		user.Email,
		user.Phone,
		user.FullName,
		string(user.Role),
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	h.otpHandler.InvalidateOTP(req.Email)          // Invalidate the OTP after successful verification
	h.otpHandler.DeleteRegistrationData(req.Email) // Remove pending registration data after successful verification

	//prepare the response without exposing sensitive information like password hash
	response := utils.RegisterResponse{
		ID:              user.ID,
		FullName:        user.FullName,
		Email:           user.Email,
		Role:            user.Role,
		IsEmailVerified: user.IsEmailVerified,
		CreatedAt:       utils.FormatDateTime(user.CreatedAt),
	}

	// Generate a refresh token to enable auto login for the user after registration without needing to log in again immediately
	refreshToken, err := auth.CreateRefreshToken(
		user.ID.String(),
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token: " + err.Error()})
		return
	}

	//send the response back to the client
	c.JSON(http.StatusOK, gin.H{
		"message":       "User registered successfully",
		"token":         token,
		"refresh_token": refreshToken,
		"user":          response,
	})
}

func (h *EventHubHandler) handleLogin(c *gin.Context) {
	//bind the incoming JSON request to the LoginRequest struct
	var req models.LoginRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//retrieve the user from the database using the provided email address
	user, err := h.querier.GetUserByEmail(c, req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	//verify the provided password against the stored password hash using the utility function
	err = auth.VerifyPassword(user.PasswordHash, req.PasswordHash)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	//check if the user's email is verified before allowing login
	if user.IsEmailVerified == nil || !*user.IsEmailVerified {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not verified"})
		return
	}

	// Generate a JWT token for the authenticated user
	token, err := auth.CreateToken(
		user.ID,
		user.Email,
		user.Phone,
		user.FullName,
		string(user.Role),
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	// Generate a refresh token for the authenticated user that keeps them logged in for a longer period without needing to re-enter credentials
	refreshToken, err := auth.CreateRefreshToken(
		user.ID.String(),
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token: " + err.Error()})
		return
	}

	response := utils.LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User: utils.RegisterResponse{
			ID:              user.ID,
			FullName:        user.FullName,
			Email:           user.Email,
			Role:            user.Role,
			IsEmailVerified: user.IsEmailVerified,
			CreatedAt:       utils.FormatDateTime(user.CreatedAt),
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    response,
	})
}

func (h *EventHubHandler) handleRefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if the provided refresh token has been revoked to prevent the use of invalidated tokens for generating new access tokens, ensuring that users can securely log out and invalidate their sessions when needed
	if h.revocationStore.IsRevoked(req.RefreshToken) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has been revoked"})
		return
	}

	// Verify the provided refresh token and extract the claims to identify the user for whom the new access token should be generated
	claims, err := auth.VerifyRefreshToken(req.RefreshToken, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// Extract the user ID from the claims and retrieve the corresponding user from the database to ensure that the user still exists and is valid before generating a new access token
	userID := claims.Subject

	user, err := h.querier.GetUserByID(c, uuid.MustParse(userID))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Generate a new access token for the user using the same information as the original token, ensuring that the user can continue to access protected resources without needing to log in again
	newToken, err := auth.CreateToken(
		user.ID,
		user.Email,
		user.Phone,
		user.FullName,
		string(user.Role),
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Token refreshed successfully",
		"token":   newToken,
	})
}

func (h *EventHubHandler) handleLogout(c *gin.Context) {
	var req models.RefreshTokenRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the provided refresh token to ensure that it is valid and extract the claims to identify the user for whom the token should be revoked, allowing the user to log out securely by invalidating their refresh token and preventing it from being used to generate new access tokens in the future
	claims, err := auth.VerifyRefreshToken(req.RefreshToken, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Revoke the refresh token by adding it to the revocation store, ensuring that it cannot be used to generate new access tokens in the future and effectively logging the user out of their session
	h.revocationStore.Revoke(req.RefreshToken, claims.ExpiresAt.Time)
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

func (h *EventHubHandler) handleForgotPassword(c *gin.Context) {
	var req models.UserRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//check if the email exists in the database to prevent sending OTP to non-existent email addresses
	_, err = h.querier.GetUserByEmail(c, req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "if email exists, an otp has been sent already"})
		return
	}

	// Generate a new OTP for the provided email address and send it to the user's email to allow them to reset their password securely without exposing any information about the existence of the email in the system
	otpCode, err := h.otpHandler.GenerateResetOTP(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	// Send the generated OTP to the user's email address using the email utility function, ensuring that the user receives the OTP needed to reset their password securely
	err = email.SendOTP(h.gmailUser, h.gmailPassword, req.Email, otpCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset otp sent successfully"})
}

func (h *EventHubHandler) handlePasswrordReset(c *gin.Context) {
	var req models.ResetPasswordRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the provided OTP for password reset and ensure that it is valid and has not expired before allowing the user to reset their password securely
	ok, err := h.otpHandler.VerifyResetOTP(req.Email, req.Otp)
	if err != nil || !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired OTP"})
		return
	}

	// Hash the new password provided by the user before storing it in the database to ensure that the user's password is stored securely and cannot be easily compromised
	hashedPassword, err := auth.HashPassword(req.PasswordHash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update the user's password in the database with the new hashed password, ensuring that the user can log in with their new password securely
	err = h.querier.UpdateUserPassword(c, repo.UpdateUserPasswordParams{
		PasswordHash: hashedPassword,
		Email:        req.Email,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password: " + err.Error()})
		return
	}

	h.otpHandler.InvalidateResetOTP(req.Email) // Invalidate the OTP after successful password reset

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

func (h *EventHubHandler) handleGetCurrentUser(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": claims})
}

func (h *EventHubHandler) handleResendOTP(c *gin.Context) {
	var req models.UserRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if there is a pending registration for the provided email address to ensure that a new OTP is only generated and sent if there is an existing registration process that requires email verification,
	_, exists := h.otpHandler.GetRegistrationData(req.Email)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No pending registration found for this email"})
		return
	}

	//Generate new otp (invalidates old one automatically by overwriting it)
	newOTP, err := h.otpHandler.GenerateOTP(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new OTP"})
		return
	}

	err = email.SendOTP(h.gmailUser, h.gmailPassword, req.Email, newOTP)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "A new OTP has been sent to your email"})
}
