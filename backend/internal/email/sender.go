// email sending logic for sending OTPs and other notifications to users
package email

import "fmt"

func SendOTP(senderEmail, appPassword, to, otp string) error {
	subject := "Your OTP Code for EventHub"
	body := fmt.Sprintf("Your OTP code is: %s. It will expire in 10 minutes.", otp)
	return EmailTemplate(senderEmail, appPassword, to, subject, body)
}