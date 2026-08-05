package com.portfolio.booking.service.model;

import java.time.LocalDateTime;

/** Ventana de tiempo reservable, derivada de combinar Availability + Resource.slotDurationMinutes. */
public record TimeSlot(LocalDateTime start, LocalDateTime end) {
}
