// This file contains the logic for sending OTP emails to users for email verification
package auth

import (
	"errors"

	"github.com/le-arch/EventHub-C5/internal/email"
)

// helper for handle register handler to send OTP email for email verification
func (h *OTPHandler) SendOtpEmail(recipientEmail, code string, pendingData interface{}) error {
	generatedCode, err := h.GenerateOTP(recipientEmail)
	if err != nil {
		return err
	}

	h.StoreRegistrationData(recipientEmail, pendingData)

	if h.emailSender != nil {
		err = h.emailSender.SendOTP(recipientEmail, generatedCode)
	} else {
		err = email.SendOTP("", "", recipientEmail, generatedCode)
	}
	if err != nil {
		h.InvalidateOTP(recipientEmail)
		h.DeleteRegistrationData(recipientEmail)
		return err
	}
	return nil
}

// VerifyEmail is a helper function for the handleVerifyEmail handler to verify the OTP code submitted by the user
func (h *OTPHandler) VerifyEmail(email, submittedCode string) (interface{}, bool, error) {
	ok, err := h.VerifyOTP(email, submittedCode)
	if err != nil{
		return nil, false, err
	}
	if !ok {
		return nil, false, nil
	}

	pendingData, exists := h.GetRegistrationData(email)
	if !exists {
		return nil, false, errors.New("no pending registration data found")
	}	

	return pendingData, true, nil
}