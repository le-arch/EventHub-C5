// fallback sender tries the primary sender first, then falls back to the secondary sender on failure
package email

import "log"

type FallbackSender struct {
	primary   Sender
	secondary Sender
}

func NewFallbackSender(primary, secondary Sender) *FallbackSender {
	return &FallbackSender{primary: primary, secondary: secondary}
}

func (f *FallbackSender) SendOTP(to, otp string) error {
	err := f.primary.SendOTP(to, otp)
	if err == nil {
		return nil
	}

	log.Printf("Primary email sender failed for %s: %v — trying fallback", to, err)
	err = f.secondary.SendOTP(to, otp)
	if err != nil {
		log.Printf("Fallback email sender also failed for %s: %v", to, err)
		return err
	}

	return nil
}
