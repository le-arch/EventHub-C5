// Supabase-based email sender using the GoTrue Auth Admin REST API.
// Emails are sent through Supabase's built-in email infrastructure,
// bypassing Render's blocked SMTP. Requires only Supabase project ref
// and service_role key — no external API key needed.
package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SupabaseConfig struct {
	ProjectRef     string
	ServiceRoleKey string
}

type SupabaseSender struct {
	config SupabaseConfig
	client *http.Client
}

func NewSupabaseSender(cfg SupabaseConfig) *SupabaseSender {
	return &SupabaseSender{
		config: cfg,
		client: &http.Client{Timeout: 15 * time.Second},
	}
}

func (s *SupabaseSender) SendOTP(to, otp string) error {
	body := map[string]interface{}{
		"email":    to,
		"subject":  "Your OTP Code for EventHub",
		"text_body": fmt.Sprintf("Your OTP code is: %s. It will expire in 10 minutes.", otp),
		"html_body": fmt.Sprintf(`<p>Your OTP code is: <strong>%s</strong></p><p>It will expire in 10 minutes.</p>`, otp),
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	url := fmt.Sprintf("https://%s.supabase.co/auth/v1/admin/send-email", s.config.ProjectRef)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.config.ServiceRoleKey)
	req.Header.Set("apikey", s.config.ServiceRoleKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("supabase request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("supabase API returned status %d", resp.StatusCode)
	}

	return nil
}
