package com.portfolio.booking.service;

import com.portfolio.booking.service.model.AuthResult;

public interface AuthService {

    AuthResult register(String email, String password, String fullName, String phone);

    AuthResult login(String email, String password);
}
