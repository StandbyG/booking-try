package com.portfolio.booking.service;

import com.portfolio.booking.entity.Resource;

import java.util.List;

public interface ResourceService {

    Resource create(Resource resource, Long managedByUserId);

    Resource update(Long id, Resource changes);

    Resource getById(Long id);

    List<Resource> listActive();

    void deactivate(Long id);
}
