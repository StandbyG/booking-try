package com.portfolio.booking.exception;

/** La regla de disponibilidad es invalida (rango de horario mal formado o solapa con otra regla existente). */
public class InvalidAvailabilityException extends RuntimeException {

    public InvalidAvailabilityException(String message) {
        super(message);
    }
}
