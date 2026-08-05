package com.portfolio.booking.dto.response;

public record ResourceResponse(
        Long id,
        String name,
        String description,
        String category,
        Integer slotDurationMinutes,
        Integer cancellationWindowHours,
        boolean active,
        Long managedByUserId
) {
}
