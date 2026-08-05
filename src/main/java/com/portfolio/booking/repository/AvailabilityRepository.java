package com.portfolio.booking.repository;

import com.portfolio.booking.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByResourceIdAndActiveTrue(Long resourceId);

    List<Availability> findByResourceIdAndDayOfWeekAndActiveTrue(Long resourceId, DayOfWeek dayOfWeek);
}
