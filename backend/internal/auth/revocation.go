// Package auth implements the logic for handling token revocation and blacklisting in the authentication system, ensuring that revoked tokens are properly invalidated and cannot be used for unauthorized access to protected resources.
package auth

import (
	"sync"
	"time"
)

type RevocationStore struct {
	mu sync.RWMutex// blacklist is a map that stores revoked token identifiers (e.g., jti) and their expiration times
	blacklist map[string]time.Time// cleanupInterval defines how often the store should clean up expired tokens from the blacklist
}

// NewRevocationStore initializes a new RevocationStore with an empty blacklist and returns its pointer
func NewRevocationStore() *RevocationStore {
	return &RevocationStore{
		blacklist: make(map[string]time.Time),
	}
}

// StartCleanupRoutine starts a background goroutine that periodically cleans up expired tokens from the blacklist
func (r *RevocationStore) Revoke(token string, expiresAt time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.blacklist[token] = expiresAt
}

func (r *RevocationStore) IsRevoked(token string) bool {
	// Check if the token is in the blacklist and if it has expired. If it has expired, remove it from the blacklist.
	r.mu.RLock()
	defer r.mu.RUnlock()
	expiry, exists := r.blacklist[token]
	if !exists {
		return false
	}
	// If the token has expired, remove it from the blacklist and return false. Otherwise, return true to indicate that the token is revoked.
	if time.Now().After(expiry) {
		delete(r.blacklist, token)
		return false
	}
	return true
}
