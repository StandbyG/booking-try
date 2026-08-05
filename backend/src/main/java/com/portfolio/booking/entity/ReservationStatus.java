package com.portfolio.booking.entity;

public enum ReservationStatus {
    /** Reservada pero pendiente de confirmacion (ej. pago externo pendiente). */
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
