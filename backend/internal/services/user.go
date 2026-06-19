package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/le-arch/EventHub-C5/internal/models"
)

// UserService handles business logic for users
type UserService struct {
	db *pgxpool.Pool
}

// NewUserService creates a new user service
func NewUserService(db *pgxpool.Pool) *UserService {
	return &UserService{db: db}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}

	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now()
	}

	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = time.Now()
	}

	query := `
		INSERT INTO users (
			id, email, phone, password_hash, full_name, role, 
			is_email_verified, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)
	`

	_, err := s.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.Phone,
		"", // password_hash will be set separately
		user.FullName,
		user.Role,
		user.IsEmailVerified,
		user.CreatedAt,
		user.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	query := `
		SELECT 
			id, email, phone, full_name, role, is_email_verified,
			created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &models.User{}
	err := s.db.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Phone,
		&user.FullName,
		&user.Role,
		&user.IsEmailVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT 
			id, email, phone, full_name, role, is_email_verified,
			created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := s.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Phone,
		&user.FullName,
		&user.Role,
		&user.IsEmailVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByPhone retrieves a user by phone
func (s *UserService) GetUserByPhone(ctx context.Context, phone string) (*models.User, error) {
	query := `
		SELECT 
			id, email, phone, full_name, role, is_email_verified,
			created_at, updated_at
		FROM users
		WHERE phone = $1
	`

	user := &models.User{}
	err := s.db.QueryRow(ctx, query, phone).Scan(
		&user.ID,
		&user.Email,
		&user.Phone,
		&user.FullName,
		&user.Role,
		&user.IsEmailVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET 
			email = $2,
			phone = $3,
			full_name = $4,
			role = $5,
			is_email_verified = $6,
			updated_at = $7
		WHERE id = $1
	`

	result, err := s.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.Phone,
		user.FullName,
		user.Role,
		user.IsEmailVerified,
		user.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("user not found")
	}

	return nil
}

// VerifyEmail marks a user's email as verified
func (s *UserService) VerifyEmail(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE users
		SET is_email_verified = true, updated_at = NOW()
		WHERE id = $1
	`

	_, err := s.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	return nil
}

// GetUsersByRole retrieves all users with a specific role
func (s *UserService) GetUsersByRole(ctx context.Context, role string, limit, offset int) ([]models.User, error) {
	query := `
		SELECT 
			id, email, phone, full_name, role, is_email_verified,
			created_at, updated_at
		FROM users
		WHERE role = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(ctx, query, role, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		user := models.User{}
		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Phone,
			&user.FullName,
			&user.Role,
			&user.IsEmailVerified,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, rows.Err()
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := s.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return errors.New("user not found")
	}

	return nil
}
