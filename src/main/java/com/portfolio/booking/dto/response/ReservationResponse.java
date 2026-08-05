package com.portfolio.booking.dto.response;

import com.portfolio.booking.entity.ReservationStatus;

import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long resourceId,
        String resourceName,
        Long clientId,
        String clientFullName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        ReservationStatus status,
        LocalDateTime cancelledAt,
        String cancellationReason
) {
}
