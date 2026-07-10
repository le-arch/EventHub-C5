package utils

import (
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

const (
	DateFormat = "2006-01-02"
	TimeFormat = "15:04:05"
	DateTimeFormat = "2006-01-02 15:04:05"
)

//parses a date string in the format "YYYY-MM-DD" and returns a time.Time object.
func ParseDate(value string) (time.Time, error) {
	t, err := time.Parse(DateFormat, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid date format, expected YYYY-MM-DD: %w", err)
	}
	return t, nil
}

// parses a time string in the format "HH:MM:SS" and returns a time.Time object.
func ParseTime(value string) (time.Time, error) {
	t, err := time.Parse(TimeFormat, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid time format, expected HH:MM:SS: %w", err)
	}
	return t, nil
}



// formats a time.Time object into a string in the format "YYYY-MM-DD"
func FormatDate(t time.Time) string {
	return t.Format(DateFormat)
}

// formats a *time.Time pointer into a string in the format "YYYY-MM-DD".
// Returns an empty string if the pointer is nil.
func FormatDatePtr(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format(DateFormat)
}

// formats a time.Time object into a string in the format "HH:MM:SS"
func FormatTime(t *string) string {
	if t == nil {
		return ""
	}
	timeStr := strings.Split(*t, ".")[0]
	return timeStr
}

// formats a time.Time object into a string in the format "YYYY-MM-DD HH:MM:SS"
func FormatDateTime(t pgtype.Timestamp) string {
	if !t.Valid {
		return ""
	}
	return t.Time.Format(DateTimeFormat)
}

// FormatDateFromPgDate converts a pgtype.Date to a formatted date string.
func FormatDateFromPgDate(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format(DateFormat)
}

// FormatTimeFromPgTime converts a pgtype.Time to a formatted time string "HH:MM".
func FormatTimeFromPgTime(t pgtype.Time) string {
	if !t.Valid {
		return ""
	}
	seconds := t.Microseconds / 1e6
	h := seconds / 3600
	m := (seconds % 3600) / 60
	return fmt.Sprintf("%02d:%02d", h, m)
}

