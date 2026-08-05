package com.portfolio.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * El recurso reservable (cancha, consultorio, silla de salon, etc).
 *
 * Seam de escalabilidad: hoy el sistema es single-tenant, pero {@code managedBy}
 * ya modela "quien administra este recurso" en vez de asumir un unico admin
 * global. El dia que se necesite multi-tenant real, se introduce una entidad
 * Business/Organization y managedBy pasa a derivarse de ella (o se le agrega
 * un business_id) sin tener que rediseñar Resource ni las reglas de
 * autorizacion que ya dependen de "es admin Y es dueño de este resource".
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "resources")
public class Resource extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Categoria libre (ej. "CANCHA_FUTBOL", "CONSULTORIO"): a proposito no es un enum rigido. */
    @Column(length = 100)
    private String category;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes;

    @Column(name = "cancellation_window_hours", nullable = false)
    private Integer cancellationWindowHours;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "managed_by_user_id", nullable = false)
    private User managedBy;
}
