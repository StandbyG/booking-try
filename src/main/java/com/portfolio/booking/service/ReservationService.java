package com.portfolio.booking.service;

import com.portfolio.booking.entity.Reservation;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {

    Reservation create(Long resourceId, Long clientId, LocalDateTime startTime);

    Reservation cancel(Long reservationId, Long requestingUserId, boolean requestingUserIsAdmin, String reason);

    List<Reservation> listByClient(Long clientId);

    List<Reservation> listByResource(Long resourceId);
}
