// authentication related handlers for user registration, login, email verification, and password reset

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/internal/auth"
	"github.com/le-arch/EventHub-C5/internal/db/repo"
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
		"full_name": req.FullName,
		"email": req.Email,
		"phone": req.Phone,
		"role": req.Role,
		"password_hash": hashedPassword,
		"is_email_verified": false,
	}

	err = h.otpHandler.SendOtpEmail(h.gmailUser, h.gmailPassword, req.Email, "", PendingData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP email"})
		return
	}


	//send the response back to the client
	c.JSON(http.StatusOK, gin.H{ "message": "verify your email to complete registration",})
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
		Email: pendingMap["email"].(string),
		Phone: pendingMap["phone"].(string),
		Role: roleVal,
		PasswordHash: pendingMap["password_hash"].(string),
		FullName: pendingMap["full_name"].(string),
		IsEmailVerified: &verified,
	})
	//handle any errors that occur during user creation
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	} 

	// Generate a JWT token for the newly registered user
	token, err := auth.CreateToken(
		user.ID.String(), 
		user.Email, 
		user.Phone, 
		user.FullName, 
		string(user.Role), 
		h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	h.otpHandler.InvalidateOTP(req.Email) // Invalidate the OTP after successful verification
	h.otpHandler.DeleteRegistrationData(req.Email) // Remove pending registration data after successful verification


	//prepare the response without exposing sensitive information like password hash
	response := utils.RegisterResponse{
		ID: user.ID.String(),
		FullName: user.FullName,
		Email: user.Email,
		Role: user.Role,
		IsEmailVerified: user.IsEmailVerified,
		CreatedAt: user.CreatedAt.Time.Format("2006-01-02 15:04:05"),
	}

	//send the response back to the client
	c.JSON(http.StatusOK, gin.H{ 
		"message": "User registered successfully",
		"token": token,
		"user": response,
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
	err = auth.VerifyPassword(user.PasswordHash, req.PasswordHash); 
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
		user.ID.String(), 
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
	Token: token,
	RefreshToken: refreshToken,
	User: utils.RegisterResponse{
		ID: user.ID.String(),
		FullName: user.FullName,
		Email: user.Email,
		Role: user.Role,
		IsEmailVerified: user.IsEmailVerified,
		CreatedAt: user.CreatedAt.Time.Format("2006-01-02 15:04:05"),
		},
	}

	c.JSON(http.StatusOK, gin.H{ 
		"message": "Login successful",
		"user": response,
	})
}

func (h *EventHubHandler) handleRefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
		user.ID.String(), 
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
		"token": newToken,
	})
}