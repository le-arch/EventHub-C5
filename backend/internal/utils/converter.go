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
	return t.Time.Format(DateTimeFormat)
}

