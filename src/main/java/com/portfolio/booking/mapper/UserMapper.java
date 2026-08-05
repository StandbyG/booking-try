package com.portfolio.booking.mapper;

import com.portfolio.booking.dto.response.UserResponse;
import com.portfolio.booking.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
