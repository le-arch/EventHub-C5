package repo

import (
	"errors"
	"fmt"
	"log"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres" // Postgres driver
	_ "github.com/golang-migrate/migrate/v4/source/file"       // File source for migrations
)

// Migrate function applies migrations to the database.
func Migrate(dbURL string, migrationsPath string) error {
	absPath, err := filepath.Abs(migrationsPath)
	if err != nil {
		return err
	}

	m, err := migrate.New(
		"file://"+absPath,
		dbURL,
	)
	if err != nil {
		return err
	}
	defer m.Close()

	err = m.Up()
	if err != nil {
		// If dirty state, force-clean and retry
		if isDirtyError(err) {
			version := dirtyVersion(err)
			log.Printf("Dirty migration version %d detected — force-cleaning and retrying", version)
			if err := m.Force(version); err != nil {
				return fmt.Errorf("failed to force version %d: %w", version, err)
			}
			err = m.Up()
			if err != nil && !errors.Is(err, migrate.ErrNoChange) {
				return err
			}
			return nil
		}
		if !errors.Is(err, migrate.ErrNoChange) {
			return err
		}
	}

	return nil
}

func isDirtyError(err error) bool {
	return strings.Contains(err.Error(), "Dirty database version")
}

func dirtyVersion(err error) int {
	msg := err.Error()
	parts := strings.Fields(msg)
	for i, p := range parts {
		v, err := strconv.Atoi(p)
		if err == nil && i > 0 && parts[i-1] == "version" {
			return v
		}
	}
	return 1
}

// MigrateDown function rolls back migrations from the database.
func MigrateDown(dbURL string, migrationsPath string) error {
	absPath, err := filepath.Abs(migrationsPath)
	if err != nil {
		return err
	}

	// Create a new migration instance with the absolute path
	m, err := migrate.New(
		"file://"+absPath,
		dbURL,
	)
	if err != nil {
		return err
	}
	defer m.Close()

	// Apply migrations
	err = m.Down()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	return nil
}
