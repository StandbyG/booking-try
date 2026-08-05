package com.portfolio.booking.dto.request;

import jakarta.validation.constraints.Size;

public record CancelReservationRequest(

        @Size(max = 500, message = "El motivo no puede superar 500 caracteres")
        String reason
) {
}
