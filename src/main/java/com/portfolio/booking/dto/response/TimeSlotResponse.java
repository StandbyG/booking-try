package com.portfolio.booking.dto.response;

import java.time.LocalDateTime;

public record TimeSlotResponse(
        LocalDateTime start,
        LocalDateTime end
) {
}
