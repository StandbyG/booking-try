package com.portfolio.booking.repository;

import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * resource y client se traen con JOIN FETCH a proposito: con
     * spring.jpa.open-in-view=false la sesion de Hibernate se cierra al
     * terminar la transaccion del service, y el mapper (en la capa de
     * controller) accede a resource.getName()/client.getFullName() ya fuera
     * de esa transaccion. Sin el fetch explicito, esos proxies LAZY disparan
     * LazyInitializationException en vez de resolverse.
     */
    @Query("select r from Reservation r join fetch r.resource join fetch r.client "
            + "where r.client.id = :clientId order by r.startTime desc")
    List<Reservation> findByClientIdOrderByStartTimeDesc(@Param("clientId") Long clientId);

    @Query("select r from Reservation r join fetch r.resource join fetch r.client "
            + "where r.resource.id = :resourceId order by r.startTime desc")
    List<Reservation> findByResourceIdOrderByStartTimeDesc(@Param("resourceId") Long resourceId);

    @Query("select r from Reservation r join fetch r.resource join fetch r.client where r.id = :id")
    Optional<Reservation> findWithDetailsById(@Param("id") Long id);

    boolean existsByResourceIdAndStartTimeAndStatusIn(
            Long resourceId, LocalDateTime startTime, Collection<ReservationStatus> statuses);

    List<Reservation> findByResourceIdAndStatusInAndStartTimeBetween(
            Long resourceId, Collection<ReservationStatus> statuses, LocalDateTime from, LocalDateTime to);
}
