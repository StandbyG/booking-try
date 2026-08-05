package com.portfolio.booking.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record CreateAvailabilityRequest(

        @NotNull(message = "dayOfWeek es obligatorio")
        DayOfWeek dayOfWeek,

        @NotNull(message = "startTime es obligatorio")
        LocalTime startTime,

        @NotNull(message = "endTime es obligatorio")
        LocalTime endTime
) {
}
