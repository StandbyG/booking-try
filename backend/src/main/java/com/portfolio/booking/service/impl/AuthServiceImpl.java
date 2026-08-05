package com.portfolio.booking.service.impl;

import com.portfolio.booking.entity.Role;
import com.portfolio.booking.entity.User;
import com.portfolio.booking.exception.EmailAlreadyExistsException;
import com.portfolio.booking.exception.NotFoundException;
import com.portfolio.booking.repository.UserRepository;
import com.portfolio.booking.security.JwtService;
import com.portfolio.booking.security.UserPrincipal;
import com.portfolio.booking.service.AuthService;
import com.portfolio.booking.service.model.AuthResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResult register(String email, String password, String fullName, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        // Registro publico siempre crea CLIENT; usuarios ADMIN se aprovisionan
        // por fuera de este endpoint (seed de datos o gestion directa).
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .phone(phone)
                .role(Role.CLIENT)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        return buildAuthResult(saved);
    }

    @Override
    public AuthResult login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> NotFoundException.of("User", email));
        return buildAuthResult(user);
    }

    private AuthResult buildAuthResult(User user) {
        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResult(token, jwtService.getAccessTokenExpirationSeconds(), user);
    }
}
