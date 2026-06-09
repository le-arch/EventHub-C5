package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHandleCreateEventValidation(t *testing.T) {
	// Initialize handler and give it a dummy wildcard origin so CORS middleware doesn't crash
	handler := &EventHubHandler{}
	handler.frontendOrigin = "*" // 👈 This fixes the "bad origin" panic!
	
	router := handler.WireHttpHandler()

	// Setup a clean test environment router instance
	// Passing nil properties here allows testing validation layers in isolation
	h := NewEventHubHandler(nil, nil, nil, "", "", "", "")
	router := gin.Default()
	router.POST("/events", h.handleCreateEvent)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/events", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			resp := httptest.NewRecorder()

			router.ServeHTTP(resp, req)

			// We expect a 400 Bad Request because data breaks your validator.go rules
			assert.Equal(t, http.StatusBadRequest, resp.Code)
		})
	}

	// Test case checking a successful request payload execution
	t.Run("Valid Data Execution Success", func(t *testing.T) {
		goodPayload := map[string]interface{}{
			"title":        "CIMFEST 2026",
			"description":  "Cameroon International Music Festival",
			"venue":        "Open Grounds",
			"city":         "Buea",
			"ticket_price": 5000.0,
		}
		body, _ := json.Marshal(goodPayload)
		req, _ := http.NewRequest("POST", "/events", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)
		assert.Equal(t, http.StatusCreated, resp.Code)
	})
}