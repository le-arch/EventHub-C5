const (
    PaymentStatusPending   = "pending"
    PaymentStatusPaid      = "paid"
    PaymentStatusFailed    = "failed"
    PaymentStatusCancelled = "cancelled"
    PaymentStatusRefunded  = "refunded"
)


type CreateOrderRequest struct {
    EventID       uuid.UUID `json:"event_id" binding:"required"`
    TicketTypeID  uuid.UUID `json:"ticket_type_id" binding:"required"`
    AttendeeName  string    `json:"attendee_name" binding:"required"`
    AttendeePhone string    `json:"attendee_phone" binding:"required"`
    AttendeeEmail string    `json:"attendee_email"`
    Quantity      int32     `json:"quantity" binding:"required,min=1"`
}