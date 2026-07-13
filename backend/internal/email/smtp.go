// SMTP-based email sender using Gmail
package email

import (
	"fmt"
	"net/smtp"
)

type SMTPSender struct {
	senderEmail string
	appPassword string
}

func NewSMTPSender(senderEmail, appPassword string) *SMTPSender {
	return &SMTPSender{senderEmail: senderEmail, appPassword: appPassword}
}

func (s *SMTPSender) SendOTP(to, otp string) error {
	subject := "Your OTP Code for EventHub"
	body := fmt.Sprintf("Your OTP code is: %s. It will expire in 10 minutes.", otp)
	return s.sendEmail(to, subject, body)
}

func (s *SMTPSender) sendEmail(to, subject, body string) error {
	hostname := "smtp.gmail.com"
	auth := smtp.PlainAuth("", s.senderEmail, s.appPassword, hostname)

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		s.senderEmail, to, subject, body))

	return smtp.SendMail(hostname+":587", auth, s.senderEmail, []string{to}, msg)
}

// SendOTP is the legacy standalone function, kept for backward compatibility.
// Prefer using a Sender implementation directly.
func SendOTP(senderEmail, appPassword, to, otp string) error {
	return NewSMTPSender(senderEmail, appPassword).SendOTP(to, otp)
}
