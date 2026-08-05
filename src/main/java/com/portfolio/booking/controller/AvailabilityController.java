package com.portfolio.booking.controller;

import com.portfolio.booking.dto.request.CreateAvailabilityRequest;
import com.portfolio.booking.dto.response.AvailabilityResponse;
import com.portfolio.booking.dto.response.TimeSlotResponse;
import com.portfolio.booking.entity.Availability;
import com.portfolio.booking.mapper.AvailabilityMapper;
import com.portfolio.booking.mapper.ReservationMapper;
import com.portfolio.booking.service.AvailabilityService;
import com.portfolio.booking.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Availability", description = "Disponibilidad semanal recurrente y consulta de slots")
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final SlotService slotService;
    private final AvailabilityMapper availabilityMapper;
    private final ReservationMapper reservationMapper;

    @PostMapping("/api/v1/resources/{resourceId}/availabilities")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Definir una regla de disponibilidad semanal (solo ADMIN)")
    public AvailabilityResponse create(@PathVariable Long resourceId,
                                        @Valid @RequestBody CreateAvailabilityRequest request) {
        Availability availability = availabilityService.create(
                resourceId, request.dayOfWeek(), request.startTime(), request.endTime());
        return availabilityMapper.toResponse(availability);
    }

    @GetMapping("/api/v1/resources/{resourceId}/availabilities")
    @Operation(summary = "Listar reglas de disponibilidad activas de un resource")
    public List<AvailabilityResponse> listByResource(@PathVariable Long resourceId) {
        return availabilityService.listByResource(resourceId).stream()
                .map(availabilityMapper::toResponse)
                .toList();
    }

    @DeleteMapping("/api/v1/availabilities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar una regla de disponibilidad (solo ADMIN)")
    public void delete(@PathVariable Long id) {
        availabilityService.delete(id);
    }

    @GetMapping("/api/v1/resources/{resourceId}/slots")
    @Operation(summary = "Consultar slots disponibles de un resource en un rango de fechas")
    public List<TimeSlotResponse> getAvailableSlots(
            @PathVariable Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return slotService.getAvailableSlots(resourceId, from, to).stream()
                .map(reservationMapper::toResponse)
                .toList();
    }
}
