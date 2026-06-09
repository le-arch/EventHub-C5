package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestCreateEventIntegration(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Setup a clean test environment router instance
	// Passing nil properties here allows testing validation layers in isolation
	h := NewEventHubHandler(nil, nil, nil, "", "", "", "")
	router := gin.Default()
	router.POST("/events", h.handleCreateEvent)

	// Test Case A: Testing standard request validation rejection (Empty Title field)
	t.Run("Should fail when event title is missing", func(t *testing.T) {
		badPayload := map[string]interface{}{
			"title":        "",
			"description":  "Annual music gathering in Buea",
			"venue":        "Open Ground",
			"city":         "Buea",
			"ticket_price": 2500,
		}

		jsonBytes, _ := json.Marshal(badPayload)
		req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")

		responseRecorder := httptest.NewRecorder()
		router.ServeHTTP(responseRecorder, req)

		if responseRecorder.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400 Bad Request for empty title, but got %d", responseRecorder.Code)
		}
	})

	// Test Case B: Testing valid structure processing acceptance
	t.Run("Should pass when all fields conform to validation schema guidelines", func(t *testing.T) {
		goodPayload := map[string]interface{}{
			"title":        "CIMFEST 2026",
			"description":  "Cameroon International Music Festival showcase",
			"venue":        "Alliance Française",
			"city":         "Buea",
			"ticket_price": 5000,
		}

		jsonBytes, _ := json.Marshal(goodPayload)
		req, _ := http.NewRequest(http.MethodPost, "/events", bytes.NewBuffer(jsonBytes))
		req.Header.Set("Content-Type", "application/json")

		responseRecorder := httptest.NewRecorder()
		router.ServeHTTP(responseRecorder, req)

		if responseRecorder.Code != http.StatusCreated {
			t.Errorf("Expected status 201 Created for valid data input, but got %d", responseRecorder.Code)
		}
	})
}