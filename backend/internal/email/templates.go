// email templates for generating HTML and plain text emails
package email

import (
	"fmt"
	"net/smtp"
)
// EmailTemplate generates the email content for sending OTPs and other notifications to users
func EmailTemplate(senderEmail, appPassword, to, subject, body string) error {
	hostname := "smtp.gmail.com"
	auth := smtp.PlainAuth("", senderEmail, appPassword, hostname)

	// Construct the email message
	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", senderEmail, to, subject, body))

	// Send the email
	err := smtp.SendMail(hostname+":587", auth, senderEmail, []string{to}, msg)
	return err
}