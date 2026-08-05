package com.portfolio.booking.mapper;

import com.portfolio.booking.dto.request.CreateResourceRequest;
import com.portfolio.booking.dto.request.UpdateResourceRequest;
import com.portfolio.booking.dto.response.ResourceResponse;
import com.portfolio.booking.entity.Resource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResourceMapper {

    @Mapping(target = "managedByUserId", source = "managedBy.id")
    ResourceResponse toResponse(Resource resource);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    Resource toEntity(CreateResourceRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "managedBy", ignore = true)
    Resource toEntity(UpdateResourceRequest request);
}
