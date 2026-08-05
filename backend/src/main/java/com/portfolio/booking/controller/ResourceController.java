package com.portfolio.booking.controller;

import com.portfolio.booking.dto.request.CreateResourceRequest;
import com.portfolio.booking.dto.request.UpdateResourceRequest;
import com.portfolio.booking.dto.response.ResourceResponse;
import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.mapper.ResourceMapper;
import com.portfolio.booking.security.UserPrincipal;
import com.portfolio.booking.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "CRUD de recursos reservables (canchas, consultorios, etc)")
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceMapper resourceMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un nuevo resource (solo ADMIN)")
    public ResourceResponse create(@Valid @RequestBody CreateResourceRequest request,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = resourceMapper.toEntity(request);
        Resource created = resourceService.create(resource, principal.getId());
        return resourceMapper.toResponse(created);
    }

    @GetMapping
    @Operation(summary = "Listar resources activos")
    public List<ResourceResponse> listActive() {
        return resourceService.listActive().stream().map(resourceMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un resource por id")
    public ResourceResponse getById(@PathVariable Long id) {
        return resourceMapper.toResponse(resourceService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar un resource (solo ADMIN)")
    public ResourceResponse update(@PathVariable Long id, @Valid @RequestBody UpdateResourceRequest request) {
        Resource changes = resourceMapper.toEntity(request);
        Resource updated = resourceService.update(id, changes);
        return resourceMapper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desactivar un resource (solo ADMIN)")
    public void deactivate(@PathVariable Long id) {
        resourceService.deactivate(id);
    }
}
