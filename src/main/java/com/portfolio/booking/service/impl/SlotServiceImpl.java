package com.portfolio.booking.service.impl;

import com.portfolio.booking.entity.Availability;
import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.entity.ReservationStatus;
import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.exception.NotFoundException;
import com.portfolio.booking.repository.AvailabilityRepository;
import com.portfolio.booking.repository.ReservationRepository;
import com.portfolio.booking.repository.ResourceRepository;
import com.portfolio.booking.service.SlotService;
import com.portfolio.booking.service.model.TimeSlot;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private static final long MAX_RANGE_DAYS = 90;

    private final ResourceRepository resourceRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public List<TimeSlot> getAvailableSlots(Long resourceId, LocalDate fromDate, LocalDate toDate) {
        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("toDate no puede ser anterior a fromDate");
        }
        if (java.time.temporal.ChronoUnit.DAYS.between(fromDate, toDate) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("El rango de fechas no puede superar " + MAX_RANGE_DAYS + " dias");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> NotFoundException.of("Resource", resourceId));

        List<Availability> rules = availabilityRepository.findByResourceIdAndActiveTrue(resourceId);

        List<TimeSlot> candidates = new ArrayList<>();
        for (LocalDate date = fromDate; !date.isAfter(toDate); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            for (Availability rule : rules) {
                if (rule.getDayOfWeek() != dayOfWeek) {
                    continue;
                }
                candidates.addAll(generateSlotsForRule(date, rule, resource.getSlotDurationMinutes()));
            }
        }

        LocalDateTime now = LocalDateTime.now();
        candidates.removeIf(slot -> slot.start().isBefore(now));

        Set<LocalDateTime> taken = reservationRepository
                .findByResourceIdAndStatusInAndStartTimeBetween(
                        resourceId,
                        List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED),
                        fromDate.atStartOfDay(),
                        toDate.plusDays(1).atStartOfDay())
                .stream()
                .map(Reservation::getStartTime)
                .collect(Collectors.toCollection(HashSet::new));

        return candidates.stream()
                .filter(slot -> !taken.contains(slot.start()))
                .sorted((a, b) -> a.start().compareTo(b.start()))
                .toList();
    }

    private List<TimeSlot> generateSlotsForRule(LocalDate date, Availability rule, int slotDurationMinutes) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = rule.getStartTime();
        while (!cursor.plusMinutes(slotDurationMinutes).isAfter(rule.getEndTime())) {
            LocalDateTime start = date.atTime(cursor);
            LocalDateTime end = start.plusMinutes(slotDurationMinutes);
            slots.add(new TimeSlot(start, end));
            cursor = cursor.plusMinutes(slotDurationMinutes);
        }
        return slots;
    }
}
