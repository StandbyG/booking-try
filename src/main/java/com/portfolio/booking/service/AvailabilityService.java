package com.portfolio.booking.service;

import com.portfolio.booking.entity.Availability;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public interface AvailabilityService {

    Availability create(Long resourceId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime);

    List<Availability> listByResource(Long resourceId);

    void delete(Long availabilityId);
}
