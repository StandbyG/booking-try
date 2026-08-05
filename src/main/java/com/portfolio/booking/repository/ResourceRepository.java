package com.portfolio.booking.repository;

import com.portfolio.booking.entity.Resource;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByActiveTrue();

    /**
     * Toma un lock pesimista de escritura (SELECT ... FOR UPDATE) sobre la fila
     * del resource. Es el punto central de la prevencion de doble-booking: toda
     * transaccion que intente crear una reserva para este resource pasa primero
     * por aqui, y queda bloqueada hasta que la transaccion que ya tiene el lock
     * haga commit o rollback. Ver el javadoc de Reservation para el porque de
     * pesimista sobre optimista en este caso especifico.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Resource r where r.id = :id")
    Optional<Resource> findByIdForUpdate(@Param("id") Long id);
}
