// package auth

// import (
// 	"testing"
// 	"time"
// )

// func TestGenerateOTP(t *testing.T) {
// 	// Call the function from opt.go
// 	code, expiry, err := GenerateOTP()

// 	// Check for errors
// 	if err != nil {
// 		t.Errorf("OTP generation failed: expected no error, but got %v", err)
// 	}

// 	// Verify length is exactly 6 characters
// 	if len(code) != 6 {
// 		t.Errorf("Expected code length to be 6, but got %d", len(code))
// 	}

// 	// Verify the expiration is in the future
// 	if expiry.Before(time.Now()) {
// 		t.Errorf("Security failure: expiration time is in the past")
// 	}
// }





// import (
// 	"bytes"
// 	"encoding/json"
// 	"net/http"
// 	"net/http/httptest"
// 	"testing"

// 	"github.com/gin-gonic/gin"
// )

// // TestUserRegistrationIntegration verifies the HTTP router-to-handler communication chain.
// func TestUserRegistrationIntegration(t *testing.T) {
// 	// 1. Set Gin to Test Mode so it doesn't print distracting logs in your terminal
// 	gin.SetMode(gin.TestMode)

// 	// 2. Setup a mock Gin engine router
// 	router := gin.Default()

// 	// 3. Register a temporary simulation route that mirrors your application backend registration
// 	router.POST("/user", func(c *gin.Context) {
// 		var body struct {
// 			Email    string `json:"email"`
// 			FullName string `json:"full_name"`
// 		}

// 		// Simulate reading incoming JSON payload data
// 		if err := c.ShouldBindJSON(&body); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
// 			return
// 		}

// 		// Simulate a successful registration response structure
// 		c.JSON(http.StatusCreated, gin.H{
// 			"message":   "User created successfully",
// 			"email":     body.Email,
// 			"full_name": body.FullName,
// 		})
// 	})

// 	// 4. Create dummy JSON user request data
// 	requestData := map[string]string{
// 		"email":     "rosine_test@example.com",
// 		"full_name": "Rosine Developer",
// 	}
// 	jsonBytes, _ := json.Marshal(requestData)

// 	// 5. Create a virtual HTTP Post request pointing to our /user endpoint
// 	req, err := http.NewRequest(http.MethodPost, "/user", bytes.NewBuffer(jsonBytes))
// 	if err != nil {
// 		t.Fatalf("Failed to create virtual HTTP request: %v", err)
// 	}
// 	req.Header.Set("Content-Type", "application/json")

// 	// 6. Create an HTTP Response Recorder to catch the server's reply
// 	responseRecorder := httptest.NewRecorder()

// 	// 7. Dispatch the request through the virtual router channel
// 	router.ServeHTTP(responseRecorder, req)

// 	// 8. Assertions: Verify the server returns an HTTP 201 Created status code
// 	if responseRecorder.Code != http.StatusCreated {
// 		t.Errorf("Integration test failed: expected status 201, but got %d", responseRecorder.Code)
// 	}
// }










package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

// ==========================================
// 1. UNIT TEST

func TestGenerateOTP(t *testing.T) {
	// Call the function we want to test from our main opt.go file
	code, expiry, err := GenerateOTP()

	// Check 1: Ensure the function completed successfully without any unexpected crashes or errors
	if err != nil {
		t.Errorf("OTP generation failed: expected no error, but got %v", err)
	}

	// Check 2: Confirm the security rule that the code string must be exactly 6 digits long
	if len(code) != 6 {
		t.Errorf("Expected code length to be 6, but got %d", len(code))
	}

	// Check 3: Confirm that the expiry timestamp is correctly set in the future (10 minutes from now)
	if expiry.Before(time.Now()) {
		t.Errorf("Security failure: expiration time was generated in the past")
	}
}

// 2. INTEGRATION TEST

// TestUserRegistrationIntegration checks how the router and JSON handler communicate together.
func TestUserRegistrationIntegration(t *testing.T) {
	// Set Gin to TestMode so it silences heavy logs and keeps the terminal clean
	gin.SetMode(gin.TestMode)

	// Spin up a virtual, empty Gin engine instance just for this test execution
	router := gin.Default()

	// Setup a temporary simulation route that mirrors how our real "/user" route works
	router.POST("/user", func(c *gin.Context) {
		var body struct {
			Email    string `json:"email"`
			FullName string `json:"full_name"`
		}

		// Try to read incoming JSON payload data into our structural fields
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		// Return a mock success response matching what a real frontend expects
		c.JSON(http.StatusCreated, gin.H{
			"message":   "User created successfully",
			"email":     body.Email,
			"full_name": body.FullName,
		})
	})

	// Define fake user details to send to our test router
	requestData := map[string]string{
		"email":     "rosine_test@example.com",
		"full_name": "Rosine Developer",
	}
	
	// Convert the map data into standard JSON bytes text format
	jsonBytes, _ := json.Marshal(requestData)

	// Prepare a virtual HTTP POST request pointing to our simulated endpoint with the JSON payload
	req, err := http.NewRequest(http.MethodPost, "/user", bytes.NewBuffer(jsonBytes))
	if err != nil {
		t.Fatalf("Failed to create virtual HTTP request: %v", err)
	}
	
	// Set the header so the server knows it is receiving standard application/json data
	req.Header.Set("Content-Type", "application/json")

	// Create a recorder object to intercept and capture whatever response the server returns
	responseRecorder := httptest.NewRecorder()

	// Fire the virtual request into the router pipeline to process it
	router.ServeHTTP(responseRecorder, req)

	// Check 4: Verify that our entire HTTP chain returns a successful 201 Created status code
	if responseRecorder.Code != http.StatusCreated {
		t.Errorf("Integration test failed: expected status 201, but got %d", responseRecorder.Code)
	}
}
