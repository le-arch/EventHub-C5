package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type EmailService struct {
	apiKey     string
	fromEmail  string
	fromName   string
	useResend  bool
	smtpConfig *SMTPConfig // optional fallback
}

type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
}

type ResendRequest struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Html    string `json:"html"`
}

func NewEmailService() *EmailService {
	apiKey := os.Getenv("RESEND_API_KEY")
	return &EmailService{
		apiKey:    apiKey,
		fromEmail: os.Getenv("EMAIL_FROM"),
		fromName:  "EventHub",
		useResend: apiKey != "",
	}
}

// SendOTP sends a 6-digit OTP to the user's email
func (s *EmailService) SendOTP(toEmail, otpCode string) error {
	subject := "Your EventHub Verification Code"
	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2563EB;">EventHub</h2>
			<p>Your verification code is:</p>
			<div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
				%s
			</div>
			<p>This code will expire in 10 minutes.</p>
			<p>If you didn't request this, please ignore this email.</p>
			<hr />
			<p style="font-size: 12px; color: #6B7280;">EventHub – Event Management Platform</p>
		</div>
	`, otpCode)

	return s.send(toEmail, subject, html)
}

// SendPasswordReset sends a password reset link (with token)
func (s *EmailService) SendPasswordReset(toEmail, resetToken string) error {
	frontendURL := os.Getenv("FRONTEND_ORIGIN")
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, resetToken)

	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2563EB;">EventHub</h2>
			<p>You requested to reset your password.</p>
			<p>Click the button below to set a new password:</p>
			<div style="text-align: center;">
				<a href="%s" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
			</div>
			<p>If you didn't request this, please ignore this email.</p>
			<p>This link will expire in 1 hour.</p>
			<hr />
			<p style="font-size: 12px; color: #6B7280;">EventHub – Event Management Platform</p>
		</div>
	`, resetLink)

	return s.send(toEmail, "Reset Your EventHub Password", html)
}

// SendTicketReceipt sends a receipt after successful ticket purchase
func (s *EmailService) SendTicketReceipt(toEmail, attendeeName, eventTitle, ticketType string, quantity, totalAmount int) error {
	subject := fmt.Sprintf("Your Ticket for %s", eventTitle)
	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2563EB;">EventHub</h2>
			<p>Hello %s,</p>
			<p>Your ticket purchase was successful!</p>
			<div style="background: #F9FAFB; padding: 16px; border-radius: 8px;">
				<p><strong>Event:</strong> %s</p>
				<p><strong>Ticket Type:</strong> %s</p>
				<p><strong>Quantity:</strong> %d</p>
				<p><strong>Total Paid:</strong> %d XAF</p>
			</div>
			<p>You can download your QR code ticket from your EventHub dashboard.</p>
			<p>We look forward to seeing you at the event!</p>
			<hr />
			<p style="font-size: 12px; color: #6B7280;">EventHub – Event Management Platform</p>
		</div>
	`, attendeeName, eventTitle, ticketType, quantity, totalAmount)

	return s.send(toEmail, subject, html)
}

// send is the internal method that actually sends the email using Resend or SMTP
func (s *EmailService) send(to, subject, htmlContent string) error {
	if s.useResend {
		return s.sendViaResend(to, subject, htmlContent)
	}
	// Fallback to SMTP (implement if needed)
	return fmt.Errorf("no email provider configured")
}

func (s *EmailService) sendViaResend(to, subject, htmlContent string) error {
	payload := ResendRequest{
		From:    fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		To:      to,
		Subject: subject,
		Html:    htmlContent,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API error: %s", resp.Status)
	}
	return nil
}