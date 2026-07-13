// email sending abstraction
package email

type Sender interface {
	SendOTP(to, otp string) error
}
