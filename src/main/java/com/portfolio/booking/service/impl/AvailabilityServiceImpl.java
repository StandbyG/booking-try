package com.portfolio.booking.service.impl;

import com.portfolio.booking.entity.Availability;
import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.exception.InvalidAvailabilityException;
import com.portfolio.booking.exception.NotFoundException;
import com.portfolio.booking.repository.AvailabilityRepository;
import com.portfolio.booking.repository.ResourceRepository;
import com.portfolio.booking.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional
    public Availability create(Long resourceId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new InvalidAvailabilityException("endTime debe ser posterior a startTime");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> NotFoundException.of("Resource", resourceId));

        List<Availability> existingSameDay =
                availabilityRepository.findByResourceIdAndDayOfWeekAndActiveTrue(resourceId, dayOfWeek);
        boolean overlaps = existingSameDay.stream()
                .anyMatch(existing -> startTime.isBefore(existing.getEndTime()) && existing.getStartTime().isBefore(endTime));
        if (overlaps) {
            throw new InvalidAvailabilityException(
                    "La regla se solapa con una disponibilidad existente para " + dayOfWeek);
        }

        Availability availability = Availability.builder()
                .resource(resource)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .active(true)
                .build();

        return availabilityRepository.save(availability);
    }

    @Override
    public List<Availability> listByResource(Long resourceId) {
        return availabilityRepository.findByResourceIdAndActiveTrue(resourceId);
    }

    @Override
    @Transactional
    public void delete(Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> NotFoundException.of("Availability", availabilityId));
        availabilityRepository.delete(availability);
    }
}
