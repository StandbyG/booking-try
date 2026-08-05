package com.portfolio.booking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.booking.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Sin este bean, un request sin token (o con token invalido) recibe un 403
 * vacio del AccessDeniedHandler por defecto de Spring Security, en vez de un
 * 401 con el mismo formato JSON que el resto de la API. Distingue "no estas
 * autenticado" (401, esto) de "estas autenticado pero sin permiso" (403,
 * manejado por GlobalExceptionHandler via AccessDeniedException).
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws java.io.IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse body = new ErrorResponse(
                Instant.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Se requiere autenticacion para acceder a este recurso",
                request.getRequestURI(),
                null
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
