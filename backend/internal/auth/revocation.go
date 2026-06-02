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

func NewRevocationStore() *RevocationStore {
	return &RevocationStore{
		blacklist: make(map[string]time.Time),
	}
}

func (r *RevocationStore) RevokeToken(token string, expiresAt time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.blacklist[token] = expiresAt
}

func (r *RevocationStore) IsRevoked(token string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	expiry, exists := r.blacklist[token]
	if !exists {
		return false
	}
	if time.Now().After(expiry) {
		delete(r.blacklist, token)
		return false
	}
	return true
}
