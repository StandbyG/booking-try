package com.portfolio.booking.controller;

import com.portfolio.booking.dto.request.LoginRequest;
import com.portfolio.booking.dto.request.RegisterRequest;
import com.portfolio.booking.dto.response.AuthResponse;
import com.portfolio.booking.mapper.UserMapper;
import com.portfolio.booking.service.AuthService;
import com.portfolio.booking.service.model.AuthResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registro y login (JWT)")
@SecurityRequirements
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un nuevo cliente")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        AuthResult result = authService.register(
                request.email(), request.password(), request.fullName(), request.phone());
        return toResponse(result);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesion")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        AuthResult result = authService.login(request.email(), request.password());
        return toResponse(result);
    }

    private AuthResponse toResponse(AuthResult result) {
        return new AuthResponse(
                result.accessToken(), "Bearer", result.expiresInSeconds(), userMapper.toResponse(result.user()));
    }
}
