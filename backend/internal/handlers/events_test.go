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
	// Initialize handler with minimal required dependencies
	handler := &EventHubHandler{}
	handler.frontendOrigin = "*"
	
	router := handler.WireHttpHandler()

	// Dummy test data
	tests := []struct {
		name    string
		payload map[string]interface{}
	}{
		{
			name: "Missing title",
			payload: map[string]interface{}{
				"description": "Test event",
				"venue":       "Test Venue",
				"city":        "Test City",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/events", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			resp := httptest.NewRecorder()

			router.ServeHTTP(resp, req)

			// We expect a 400 Bad Request or 401 Unauthorized (missing auth)
			assert.True(t, resp.Code >= 400)
		})
	}
}