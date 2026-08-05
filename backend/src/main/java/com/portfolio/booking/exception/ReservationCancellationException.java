package com.portfolio.booking.exception;

/** La reserva no puede cancelarse: ya esta cancelada/completada, o se paso la ventana minima de cancelacion. */
public class ReservationCancellationException extends RuntimeException {

    public ReservationCancellationException(String message) {
        super(message);
    }
}
