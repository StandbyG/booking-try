package com.portfolio.booking.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateReservationRequest(

        @NotNull(message = "resourceId es obligatorio")
        Long resourceId,

        @NotNull(message = "startTime es obligatorio")
        LocalDateTime startTime
) {
}
