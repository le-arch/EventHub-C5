// payment processing logic for integrating with MoMo payment gateway
package payment

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/le-arch/EventHub-C5/internal/models"
	"github.com/le-arch/EventHub-C5/internal/utils"
)

type Config struct {
	APIURL            string
	SubscriptionKey   string
	APIUser           string
	APIKey            string
	TargetEnvironment string
	CallbackURL       string
}

type Client struct {
	cfg        Config
	httpClient *http.Client
	token		string
	tokenExp	time.Time
}

func NewClient(cfg Config) *Client {
	return &Client{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}


// getAccessToken obtains a new OAuth2 token from MTN.
func (c *Client) getAccessToken(ctx context.Context) (string, error) {
	// Check if cached token is still valid
	if c.token != "" && time.Now().Before(c.tokenExp) {
		return c.token, nil
	}

	url := c.cfg.APIURL + "/collection/token/"
	req, err := http.NewRequestWithContext(ctx, "POST", url, nil)
	if err != nil {
		return "", err
	}

	// Basic Auth: APIUser:APIKey
	auth := base64.StdEncoding.EncodeToString([]byte(c.cfg.APIUser + ":" + c.cfg.APIKey))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Ocp-Apim-Subscription-Key", c.cfg.SubscriptionKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("token request failed: %s", string(body))
	}

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	c.token = result.AccessToken
	c.tokenExp = time.Now().Add(time.Duration(result.ExpiresIn) * time.Second)
	return c.token, nil
}

// RequestPayment initiates a payment request via MTN Momo.
func (c *Client) RequestPayment(ctx context.Context, req models.PaymentRequest) (*utils.PaymentResponse, error) {
	// Get access token
	token, err := c.getAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	url := c.cfg.APIURL + "/collection/v1_0/requesttopay"
	bodyBytes, _ := json.Marshal(req)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("X-Reference-Id", c.cfg.APIUser) // often the same as APIUser
	httpReq.Header.Set("X-Target-Environment", c.cfg.TargetEnvironment)
	httpReq.Header.Set("Ocp-Apim-Subscription-Key", c.cfg.SubscriptionKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("payment request failed: %s", string(body))
	}

	// Transaction ID is in the X-Reference-Id header (or in Location)
	txID := resp.Header.Get("X-Reference-Id")
	if txID == "" {
		// fallback: extract from Location header if needed
		return nil, fmt.Errorf("missing transaction reference")
	}

	return &utils.PaymentResponse{
		TransactionID: txID,
		Status:        "PENDING",
	}, nil
}
