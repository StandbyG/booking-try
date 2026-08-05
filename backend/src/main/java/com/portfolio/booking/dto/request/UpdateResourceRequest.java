package com.portfolio.booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateResourceRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        String description,

        String category,

        @NotNull(message = "slotDurationMinutes es obligatorio")
        @Min(value = 1, message = "slotDurationMinutes debe ser mayor a 0")
        Integer slotDurationMinutes,

        @NotNull(message = "cancellationWindowHours es obligatorio")
        @PositiveOrZero(message = "cancellationWindowHours no puede ser negativo")
        Integer cancellationWindowHours,

        @NotNull(message = "active es obligatorio")
        Boolean active
) {
}
