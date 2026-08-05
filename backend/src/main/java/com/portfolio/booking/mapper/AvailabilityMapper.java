package com.portfolio.booking.mapper;

import com.portfolio.booking.dto.response.AvailabilityResponse;
import com.portfolio.booking.entity.Availability;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AvailabilityMapper {

    @Mapping(target = "resourceId", source = "resource.id")
    AvailabilityResponse toResponse(Availability availability);
}
