package com.portfolio.booking.mapper;

import com.portfolio.booking.dto.response.ReservationResponse;
import com.portfolio.booking.dto.response.TimeSlotResponse;
import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.service.model.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(target = "resourceId", source = "resource.id")
    @Mapping(target = "resourceName", source = "resource.name")
    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientFullName", source = "client.fullName")
    ReservationResponse toResponse(Reservation reservation);

    TimeSlotResponse toResponse(TimeSlot slot);
}
