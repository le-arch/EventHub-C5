package payment

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
)

type CamPayClient struct {
	BaseURL   string
	APIKey    string
	Username  string
	Password  string
	HTTPClient *http.Client
}

type PaymentRequest struct {
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	PhoneNumber string  `json:"phone_number"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	Email       string  `json:"email"`
	ExternalID  string  `json:"external_id"`
	Description string  `json:"description"`
}

type PaymentResponse struct {
	Status        string `json:"status"`
	TransactionID string `json:"transaction_id"`
	PaymentURL    string `json:"payment_url"`
	Message       string `json:"message"`
}

type TransactionStatusResponse struct {
	Status string `json:"status"`
	Amount float64 `json:"amount"`
	Currency string `json:"currency"`
}

func NewCamPayClient() *CamPayClient {
	return &CamPayClient{
		BaseURL:   os.Getenv("CAMPAY_API_URL"),
		APIKey:    os.Getenv("CAMPAY_API_KEY"),
		Username:  os.Getenv("CAMPAY_USERNAME"),
		Password:  os.Getenv("CAMPAY_PASSWORD"),
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *CamPayClient) RequestPayment(req PaymentRequest) (*PaymentResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	httpReq, err := http.NewRequest("POST", c.BaseURL+"/payments", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if result.Status != "success" {
		return nil, errors.New(result.Message)
	}
	return &result, nil
}

func (c *CamPayClient) VerifyPayment(transactionID string) (*TransactionStatusResponse, error) {
	httpReq, err := http.NewRequest("GET", c.BaseURL+"/payments/"+transactionID, nil)
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result TransactionStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *CamPayClient) RefundPayment(transactionID string) error {
	httpReq, err := http.NewRequest("POST", c.BaseURL+"/payments/"+transactionID+"/refund", nil)
	if err != nil {
		return err
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("refund failed with status %d", resp.StatusCode)
	}
	return nil
}