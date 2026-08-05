package com.portfolio.booking.dto.response;

import com.portfolio.booking.entity.Role;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        Role role
) {
}
