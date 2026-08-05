package com.portfolio.booking.exception;

/**
 * El slot solicitado ya esta tomado por otra reserva activa. Se lanza tanto
 * desde la verificacion explicita dentro del lock pesimista (caso normal)
 * como al traducir una DataIntegrityViolationException si, por algun motivo,
 * el unique index parcial de BD fuera el que detecto el conflicto.
 */
public class OverlappingReservationException extends RuntimeException {

    public OverlappingReservationException(String message) {
        super(message);
    }
}
