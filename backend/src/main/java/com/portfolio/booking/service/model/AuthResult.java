package com.portfolio.booking.service.model;

import com.portfolio.booking.entity.User;

public record AuthResult(String accessToken, long expiresInSeconds, User user) {
}
