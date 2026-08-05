package com.portfolio.booking.exception;

/** El horario solicitado no corresponde a un slot valido segun la disponibilidad del resource. */
public class InvalidReservationException extends RuntimeException {

    public InvalidReservationException(String message) {
        super(message);
    }
}
