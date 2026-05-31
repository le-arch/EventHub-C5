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

	//validate email address using the utility function before proceeding with user creation
    IsEmailValid := utils.IsValidEmail(req.Email)
	if !IsEmailValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	if req.Role == "" {
		req.Role = "organizer" // default role if not provided
	}

	//create the user in the database
	user, err := h.querier.CreateUser(c, repo.CreateUserParams{
		Email: req.Email,
		Phone: req.Phone,
		Role: req.Role,
		PasswordHash: hashedPassword,
		FullName: req.FullName,
	})
	//handle any errors that occur during user creation
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	} 

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
		"user": response})
}
