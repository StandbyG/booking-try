package com.portfolio.booking.service.impl;

import com.portfolio.booking.entity.Availability;
import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.entity.ReservationStatus;
import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.entity.User;
import com.portfolio.booking.exception.InvalidReservationException;
import com.portfolio.booking.exception.NotFoundException;
import com.portfolio.booking.exception.OverlappingReservationException;
import com.portfolio.booking.exception.ReservationCancellationException;
import com.portfolio.booking.repository.AvailabilityRepository;
import com.portfolio.booking.repository.ReservationRepository;
import com.portfolio.booking.repository.ResourceRepository;
import com.portfolio.booking.repository.UserRepository;
import com.portfolio.booking.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Estrategia de concurrencia para prevenir doble-booking (ver tambien el
 * javadoc de la entidad Reservation y el indice uq_reservations_active_slot):
 *
 * Se usa LOCK PESIMISTA (SELECT ... FOR UPDATE sobre Resource), no @Version
 * optimista. Razon: el conflicto real es entre dos INSERTS de filas distintas
 * compitiendo por el mismo (resource_id, start_time) — no una actualizacion
 * concurrente de una fila ya existente, que es el caso que @Version resuelve.
 * Con optimista, ambas transacciones podrian leer "slot libre", ambas
 * insertar, y solo el UNIQUE index de BD frenaria a la segunda — pero
 * despues de gastar un roundtrip completo y sin posibilidad de reintento
 * automatico transparente para el caller. Con pesimista, la segunda
 * transaccion queda bloqueada en el FOR UPDATE hasta que la primera hace
 * commit; al despertar, su propia verificacion de "existe reserva activa en
 * este slot" ya ve la fila recien insertada y falla limpio con un mensaje de
 * dominio, sin nunca intentar el insert.
 *
 * El lock es sobre el Resource (no sobre la Reservation, que aun no existe) —
 * efectivamente serializa la creacion de reservas por resource individual,
 * sin bloquear reservas de otros resources.
 */
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final List<ReservationStatus> ACTIVE_STATUSES =
            List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public Reservation create(Long resourceId, Long clientId, LocalDateTime startTime) {
        Resource resource = resourceRepository.findByIdForUpdate(resourceId)
                .orElseThrow(() -> NotFoundException.of("Resource", resourceId));

        if (!resource.isActive()) {
            throw new InvalidReservationException("El resource no esta activo");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> NotFoundException.of("User", clientId));

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new InvalidReservationException("El horario de la reserva debe ser futuro");
        }

        LocalDateTime endTime = startTime.plusMinutes(resource.getSlotDurationMinutes());
        validateSlotMatchesAvailability(resource, startTime);

        boolean alreadyTaken = reservationRepository.existsByResourceIdAndStartTimeAndStatusIn(
                resourceId, startTime, ACTIVE_STATUSES);
        if (alreadyTaken) {
            throw new OverlappingReservationException(
                    "El slot " + startTime + " ya esta reservado para este resource");
        }

        Reservation reservation = Reservation.builder()
                .resource(resource)
                .client(client)
                .startTime(startTime)
                .endTime(endTime)
                .status(ReservationStatus.CONFIRMED)
                .build();

        try {
            return reservationRepository.saveAndFlush(reservation);
        } catch (DataIntegrityViolationException ex) {
            // Red de seguridad: si por algun motivo dos transacciones llegaron hasta aca
            // (p.ej. el lock se hubiera omitido), el unique index parcial de BD es quien
            // finalmente frena el duplicado. Lo traducimos a una excepcion de dominio.
            throw new OverlappingReservationException(
                    "El slot " + startTime + " ya esta reservado para este resource");
        }
    }

    private void validateSlotMatchesAvailability(Resource resource, LocalDateTime startTime) {
        LocalTime timeOfDay = startTime.toLocalTime();
        LocalTime slotEnd = timeOfDay.plusMinutes(resource.getSlotDurationMinutes());
        int duration = resource.getSlotDurationMinutes();

        List<Availability> rules = availabilityRepository.findByResourceIdAndDayOfWeekAndActiveTrue(
                resource.getId(), startTime.getDayOfWeek());

        boolean matches = rules.stream().anyMatch(rule -> {
            if (timeOfDay.isBefore(rule.getStartTime()) || slotEnd.isAfter(rule.getEndTime())) {
                return false;
            }
            long minutesFromRuleStart = java.time.Duration.between(rule.getStartTime(), timeOfDay).toMinutes();
            return minutesFromRuleStart % duration == 0;
        });

        if (!matches) {
            throw new InvalidReservationException(
                    "El horario solicitado no corresponde a un slot valido de disponibilidad del resource");
        }
    }

    @Override
    @Transactional
    public Reservation cancel(Long reservationId, Long requestingUserId, boolean requestingUserIsAdmin, String reason) {
        Reservation reservation = reservationRepository.findWithDetailsById(reservationId)
                .orElseThrow(() -> NotFoundException.of("Reservation", reservationId));

        boolean isOwner = reservation.getClient().getId().equals(requestingUserId);
        if (!requestingUserIsAdmin && !isOwner) {
            throw new AccessDeniedException("No podes cancelar una reserva que no es tuya");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING
                && reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ReservationCancellationException(
                    "La reserva ya esta en estado " + reservation.getStatus() + " y no puede cancelarse");
        }

        // Los admins pueden forzar la cancelacion fuera de ventana; los clientes no.
        if (!requestingUserIsAdmin) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime deadline = reservation.getStartTime()
                    .minusHours(reservation.getResource().getCancellationWindowHours());
            if (now.isAfter(deadline)) {
                throw new ReservationCancellationException(
                        "Ya no se puede cancelar: se requieren al menos "
                                + reservation.getResource().getCancellationWindowHours()
                                + " horas de anticipacion");
            }
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancellationReason(reason);
        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> listByClient(Long clientId) {
        return reservationRepository.findByClientIdOrderByStartTimeDesc(clientId);
    }

    @Override
    public List<Reservation> listByResource(Long resourceId) {
        return reservationRepository.findByResourceIdOrderByStartTimeDesc(resourceId);
    }
}
