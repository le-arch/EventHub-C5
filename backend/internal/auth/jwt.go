// jwt generation and validation logic for authentication
package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Define constants for token durations to ensure consistent expiration times across the application
const (
	accessTokenDuration = 15 * time.Minute
	RefreshTokenDuration = 365 * 24 * time.Hour
)

// Claims defines the structure of the JWT claims used for authentication, including user information and standard registered claims

type Claims struct {
	ID              uuid.UUID           `json:"id"`
	Email           string           `json:"email"`
	Phone           string           `json:"phone"`
	FullName        string           `json:"full_name"`
	Role            *string          `json:"role"`
	jwt.RegisteredClaims
}

// CreateToken generates a JWT token with the provided user information and secret key
func CreateToken(id uuid.UUID, email, phone, full_name, role, secret string) (string, error) {
	
	// Create the claims with user information and set the expiration time for the token
	claims := Claims{
		ID: id,
		Email: email,
		Phone: phone,
		FullName: full_name,
		Role: &role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
		},
	}

	// Create a new JWT token with the specified signing method and claims, then sign it using the provided secret key
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

// VerifyToken validates the provided JWT token string using the secret key and returns the claims if the token is valid
func VerifyToken(tokenString, secret string) (*Claims, error) {
	// Parse the token with the claims and validate the signing method and token validity
	t, err := jwt.ParseWithClaims(tokenString, &Claims{}, 
		// Ensure that the signing method is HMAC and return the secret key for validation
		func(t *jwt.Token) (interface{}, error){
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(secret), nil
	})
	// Handle any errors that occur during token parsing and validation
	if err != nil {
		return nil, err
	}

	// Extract the claims from the token and ensure that the token is valid before returning the claims
	claims, ok := t.Claims.(*Claims)
	if !ok || !t.Valid {
		return nil, errors.New("invalid token")
	}

	// Return the claims if the token is valid
	return claims, nil
}

// CreateRefreshToken generates a new JWT refresh token with the provided user ID and secret key, setting a longer expiration time for the refresh token
func CreateRefreshToken(userID, secret string) (string, error) {
	// Create the claims for the refresh token with the user ID and set a longer expiration time
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(RefreshTokenDuration)),
	}

	// Create a new JWT token with the specified signing method and claims, then sign it using the provided secret key
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}
	
func VerifyRefreshToken(tokenString, secret string) (*jwt.RegisteredClaims, error) {
	// Parse the refresh token with the registered claims and validate the signing method and token validity
	t, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, 
		func(t *jwt.Token) (interface{}, error){
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	// Extract the registered claims from the token and ensure that the token is valid before returning the claims
	claims, ok := t.Claims.(*jwt.RegisteredClaims)
	if !ok || !t.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
