// This file contains the logic for sending OTP emails to users for email verification
package auth

import (
	"errors"

	"github.com/le-arch/EventHub-C5/internal/email"
)

// OTPHandler is a struct that can be used to manage OTP email sending
//helper for handle register handler to send OTP email for email verification
func (h *OTPHandler) SendOtpEmail(senderEmail, appPassword, recipientEmail, code string, pendingData interface{}) error {
	generatedCode, err := h.GenerateOTP(recipientEmail)
	if err != nil {
		return err
	}

	//store the pending registration data associated with the email for later verification
	h.StoreRegistrationData(recipientEmail, pendingData)

	//send the OTP email to the user
	err = email.SendOTP(senderEmail, appPassword, recipientEmail, generatedCode)
	if err != nil {
		h.InvalidateOTP(recipientEmail)// invalidate the OTP and remove pending registration data if email sending fails
		h.DeleteRegistrationData(recipientEmail)// remove pending registration data
		return err
	}
	return nil
}


// verifyEmail is a helper function for the handleVerifyEmail handler to verify the OTP code submitted by the user
func (h *OTPHandler) VerifyEmail(senderEmail, appPassword, email, submittedCode string) (interface{}, bool, error) {
	//verify the submitted OTP code against the stored OTP for the email
	ok, err := h.VerifyOTP(email, submittedCode)
	if err != nil{
		return nil, false, err
	}
	if !ok {
		return nil, false, nil
	}

	//retrieve the pending registration data associated with the email for successful verification
	pendingData, exists := h.GetRegistrationData(email)
	if !exists {
		return nil, false, errors.New("no pending registration data found")
	}	

	return pendingData, true, nil// return the pending registration data and success status
}