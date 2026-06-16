package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

type CamPayClient struct {
	apiURL   string
	apiKey   string
	username string
	password string
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

type PaymentService struct {
	client *CamPayClient
}

func NewPaymentService() *PaymentService {
	return &PaymentService{
		client: &CamPayClient{
			apiURL:   os.Getenv("CAMPAY_API_URL"),
			apiKey:   os.Getenv("CAMPAY_API_KEY"),
			username: os.Getenv("CAMPAY_USERNAME"),
			password: os.Getenv("CAMPAY_PASSWORD"),
		},
	}
}

func (s *PaymentService) RequestPayment(orderID uuid.UUID, amount int, phone, email, name string) (transactionID string, err error) {
	req := PaymentRequest{
		Amount:      float64(amount),
		Currency:    "XAF",
		PhoneNumber: phone,
		FirstName:   name,
		LastName:    "",
		Email:       email,
		ExternalID:  orderID.String(),
		Description: fmt.Sprintf("Ticket purchase for order %s", orderID.String()),
	}
	body, _ := json.Marshal(req)
	httpReq, _ := http.NewRequest("POST", s.client.apiURL+"/payments", bytes.NewReader(body))
	httpReq.Header.Set("Authorization", "Bearer "+s.client.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var pr PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&pr); err != nil {
		return "", err
	}
	if pr.Status != "success" {
		return "", errors.New(pr.Message)
	}
	return pr.TransactionID, nil
}

func (s *PaymentService) VerifyPayment(transactionID string) (bool, error) {
	httpReq, _ := http.NewRequest("GET", s.client.apiURL+"/payments/"+transactionID, nil)
	httpReq.Header.Set("Authorization", "Bearer "+s.client.apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}
	return result.Status == "completed", nil
}