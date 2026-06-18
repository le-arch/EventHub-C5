package utils

import (
    "github.com/jackc/pgx/v5/pgtype"
    "github.com/le-arch/EventHub-C5/internal/models"
)

// ToDBRange converts JSON range to pgtype.Range[pgtype.Int4]
func ToDBRange(cr *models.CapacityRangeJSON) *pgtype.Range[pgtype.Int4] {
    if cr == nil {
        return nil
    }
    var lowerType, upperType pgtype.BoundType
    switch cr.Bounds {
    case "()":
        lowerType = pgtype.Exclusive
        upperType = pgtype.Exclusive
    case "(]":
        lowerType = pgtype.Exclusive
        upperType = pgtype.Inclusive
    case "[]":
        lowerType = pgtype.Inclusive
        upperType = pgtype.Inclusive
    default: // "[)" or empty
        lowerType = pgtype.Inclusive
        upperType = pgtype.Exclusive
    }
    r := pgtype.Range[pgtype.Int4]{
        Lower:     pgtype.Int4{Int32: cr.Lower, Valid: true},
        Upper:     pgtype.Int4{Int32: cr.Upper, Valid: true},
        LowerType: lowerType,
        UpperType: upperType,
        Valid:     true,
    }
    return &r
}

// FromDBRange converts *pgtype.Range[pgtype.Int4] to JSON
func FromDBRange(r *pgtype.Range[pgtype.Int4]) *models.CapacityRangeJSON {
    if r == nil || !r.Valid || !r.Lower.Valid || !r.Upper.Valid {
        return nil
    }
    var bounds string
    switch {
    case r.LowerType == pgtype.Inclusive && r.UpperType == pgtype.Exclusive:
        bounds = "[)"
    case r.LowerType == pgtype.Exclusive && r.UpperType == pgtype.Exclusive:
        bounds = "()"
    case r.LowerType == pgtype.Exclusive && r.UpperType == pgtype.Inclusive:
        bounds = "(]"
    case r.LowerType == pgtype.Inclusive && r.UpperType == pgtype.Inclusive:
        bounds = "[]"
    default:
        bounds = "[)"
    }
    return &models.CapacityRangeJSON{
        Lower:  r.Lower.Int32,
        Upper:  r.Upper.Int32,
        Bounds: bounds,
    }
}
