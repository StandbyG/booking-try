package com.portfolio.booking.service;

import com.portfolio.booking.service.model.TimeSlot;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {

    /**
     * Slots disponibles (no reservados) de un resource entre fromDate y toDate (inclusive),
     * derivados de sus reglas de Availability y su slotDurationMinutes.
     */
    List<TimeSlot> getAvailableSlots(Long resourceId, LocalDate fromDate, LocalDate toDate);
}
