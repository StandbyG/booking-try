package com.portfolio.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

/**
 * La reserva de un slot concreto (fecha+hora exacta) de un Resource.
 *
 * Prevencion de doble-booking: NO se apoya en {@code @Version} de BaseEntity
 * (eso es locking optimista para ediciones concurrentes de una MISMA fila
 * existente). El conflicto de doble-booking es entre dos INSERTS de filas
 * nuevas compitiendo por el mismo (resource_id, start_time). La proteccion es:
 *   1) lock pesimista (SELECT ... FOR UPDATE) sobre la fila de Resource
 *      durante la transaccion de creacion (ReservationServiceImpl), y
 *   2) constraint UNIQUE parcial en BD sobre (resource_id, start_time) para
 *      status activo (PENDING/CONFIRMED) como red de seguridad — ver
 *      V1__init_schema.sql. Esto funciona sin colisiones porque los slots
 *      tienen duracion fija y alineada (Resource.slotDurationMinutes), asi
 *      que dos reservas del mismo resource nunca se solapan parcialmente:
 *      o coinciden exactamente en start_time, o no se tocan.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "reservations")
public class Reservation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_user_id", nullable = false)
    private User client;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;
}
