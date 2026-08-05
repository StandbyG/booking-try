package com.portfolio.booking.service;

import com.portfolio.booking.entity.Resource;

import java.util.List;

public interface ResourceService {

    Resource create(Resource resource, Long managedByUserId);

    Resource update(Long id, Resource changes);

    Resource getById(Long id);

    List<Resource> listActive();

    /** Incluye inactivos: para el panel de admin, que necesita poder reactivarlos. */
    List<Resource> listAll();

    void deactivate(Long id);
}
