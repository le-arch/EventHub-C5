package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/le-arch/EventHub-C5/backend/internal/auth"
	"github.com/le-arch/EventHub-C5/backend/internal/repository"
)

type AuthService struct {
	repo    *repository.Queries
	email   *EmailService
	otp     *auth.OTPHandler
	pass    *auth.PasswordHandler
}

func NewAuthService(repo *repository.Queries, email *EmailService) *AuthService {
	return &AuthService{
		repo:  repo,
		email: email,
		otp:   auth.NewOTPHandler(nil),
		pass:  auth.NewPasswordHandler(nil),
	}
}

func (s *AuthService) Register(fullName, email, phone, password, role string) (*repository.User, error) {
	// Check existing
	_, err := s.repo.GetUserByEmail(context.Background(), email)
	if err == nil {
		return nil, errors.New("email already registered")
	}
	hashed, _ := s.pass.HashPassword(password)
	user, err := s.repo.CreateUser(context.Background(), repository.CreateUserParams{
		FullName:     fullName,
		Email:        email,
		Phone:        phone,
		PasswordHash: hashed,
		Role:         role,
	})
	if err != nil {
		return nil, err
	}
	otpCode, _ := s.otp.GenerateOTP(email)
	s.email.SendOTP(email, otpCode)
	return &user, nil
}

func (s *AuthService) VerifyOTP(email, otp string) (*repository.User, error) {
	ok, err := s.otp.VerifyOTP(email, otp)
	if !ok || err != nil {
		return nil, errors.New("invalid or expired OTP")
	}
	user, err := s.repo.UpdateUserVerified(context.Background(), email)
	if err != nil {
		return nil, err
	}
	s.otp.InvalidateOTP(email)
	return &user, nil
}

func (s *AuthService) Login(identifier, password string) (*repository.User, error) {
	user, err := s.repo.GetUserByIdentifier(context.Background(), identifier)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if !s.pass.VerifyPassword(user.PasswordHash, password) {
		return nil, errors.New("invalid credentials")
	}
	if !user.IsActive {
		return nil, errors.New("account suspended")
	}
	return &user, nil
}

func (s *AuthService) GetUserByID(userID string) (*repository.User, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	user, err := s.repo.GetUserByID(context.Background(), uid)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) UpdateProfile(userID string, fullName, email, phone string) error {
	uid, _ := uuid.Parse(userID)
	return s.repo.UpdateUserProfile(context.Background(), repository.UpdateUserProfileParams{
		ID:       uid,
		FullName: fullName,
		Email:    email,
		Phone:    phone,
	})
}

func (s *AuthService) ChangePassword(userID, currentPassword, newPassword string) error {
	uid, _ := uuid.Parse(userID)
	user, err := s.repo.GetUserByID(context.Background(), uid)
	if err != nil {
		return err
	}
	if !s.pass.VerifyPassword(user.PasswordHash, currentPassword) {
		return errors.New("current password incorrect")
	}
	hashed, _ := s.pass.HashPassword(newPassword)
	return s.repo.UpdateUserPassword(context.Background(), repository.UpdateUserPasswordParams{
		ID:           uid,
		PasswordHash: hashed,
	})
}