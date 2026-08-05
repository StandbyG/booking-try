package com.portfolio.booking.controller;

import com.portfolio.booking.dto.request.CancelReservationRequest;
import com.portfolio.booking.dto.request.CreateReservationRequest;
import com.portfolio.booking.dto.response.ReservationResponse;
import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.mapper.ReservationMapper;
import com.portfolio.booking.security.UserPrincipal;
import com.portfolio.booking.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Creacion, cancelacion y consulta de reservas")
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationMapper reservationMapper;

    @PostMapping("/api/v1/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear una reserva para el usuario autenticado")
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        Reservation reservation = reservationService.create(
                request.resourceId(), principal.getId(), request.startTime());
        return reservationMapper.toResponse(reservation);
    }

    @PostMapping("/api/v1/reservations/{id}/cancel")
    @Operation(summary = "Cancelar una reserva propia (o cualquiera si es ADMIN), respetando la ventana minima")
    public ReservationResponse cancel(@PathVariable Long id,
                                       @Valid @RequestBody(required = false) CancelReservationRequest request,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        String reason = request != null ? request.reason() : null;
        boolean isAdmin = principal.getUser().getRole().name().equals("ADMIN");
        Reservation cancelled = reservationService.cancel(id, principal.getId(), isAdmin, reason);
        return reservationMapper.toResponse(cancelled);
    }

    @GetMapping("/api/v1/reservations/me")
    @Operation(summary = "Listar las reservas del usuario autenticado")
    public List<ReservationResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return reservationService.listByClient(principal.getId()).stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    @GetMapping("/api/v1/resources/{resourceId}/reservations")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar reservas de un resource (solo ADMIN)")
    public List<ReservationResponse> listByResource(@PathVariable Long resourceId) {
        return reservationService.listByResource(resourceId).stream()
                .map(reservationMapper::toResponse)
                .toList();
    }
}
