package com.portfolio.booking.service.impl;

import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.entity.User;
import com.portfolio.booking.exception.NotFoundException;
import com.portfolio.booking.repository.ResourceRepository;
import com.portfolio.booking.repository.UserRepository;
import com.portfolio.booking.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Resource create(Resource resource, Long managedByUserId) {
        User admin = userRepository.findById(managedByUserId)
                .orElseThrow(() -> NotFoundException.of("User", managedByUserId));
        resource.setManagedBy(admin);
        resource.setActive(true);
        return resourceRepository.save(resource);
    }

    @Override
    @Transactional
    public Resource update(Long id, Resource changes) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Resource", id));

        existing.setName(changes.getName());
        existing.setDescription(changes.getDescription());
        existing.setCategory(changes.getCategory());
        existing.setSlotDurationMinutes(changes.getSlotDurationMinutes());
        existing.setCancellationWindowHours(changes.getCancellationWindowHours());
        existing.setActive(changes.isActive());

        return resourceRepository.save(existing);
    }

    @Override
    public Resource getById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Resource", id));
    }

    @Override
    public List<Resource> listActive() {
        return resourceRepository.findByActiveTrue();
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Resource", id));
        resource.setActive(false);
        resourceRepository.save(resource);
    }
}
