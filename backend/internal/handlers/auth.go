// authentication related handlers for user registration, login, email verification, and password reset

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
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