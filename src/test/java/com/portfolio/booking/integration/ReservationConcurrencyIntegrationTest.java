package com.portfolio.booking.integration;

import com.portfolio.booking.entity.Availability;
import com.portfolio.booking.entity.Reservation;
import com.portfolio.booking.entity.ReservationStatus;
import com.portfolio.booking.entity.Resource;
import com.portfolio.booking.entity.Role;
import com.portfolio.booking.entity.User;
import com.portfolio.booking.exception.InvalidReservationException;
import com.portfolio.booking.exception.OverlappingReservationException;
import com.portfolio.booking.repository.AvailabilityRepository;
import com.portfolio.booking.repository.ReservationRepository;
import com.portfolio.booking.repository.ResourceRepository;
import com.portfolio.booking.repository.UserRepository;
import com.portfolio.booking.service.ReservationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifica el requisito central del sistema: dos requests concurrentes al
 * mismo slot de un resource nunca deben resultar en dos reservas activas.
 *
 * Deliberadamente esta clase NO es @Transactional: si lo fuera, la data de
 * setup (resource/availability) quedaria en una transaccion sin commit del
 * hilo principal del test, y los hilos del ExecutorService -que abren sus
 * propias conexiones/transacciones- no la verian (no se puede leer un
 * commit ajeno inexistente). Ademas, el punto de la prueba es justamente
 * validar el locking entre transacciones REALES y separadas, que es como
 * se comportan requests HTTP concurrentes en produccion.
 */
class ReservationConcurrencyIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ReservationService reservationService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private AvailabilityRepository availabilityRepository;
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private Resource resource;
    private User clientA;
    private User clientB;
    private LocalDateTime contestedSlot;

    @BeforeEach
    void setUp() {
        User admin = userRepository.save(User.builder()
                .email("admin-concurrency@test.com")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .fullName("Admin Test")
                .role(Role.ADMIN)
                .enabled(true)
                .build());

        clientA = userRepository.save(User.builder()
                .email("client-a@test.com")
                .passwordHash(passwordEncoder.encode("Client123!"))
                .fullName("Client A")
                .role(Role.CLIENT)
                .enabled(true)
                .build());

        clientB = userRepository.save(User.builder()
                .email("client-b@test.com")
                .passwordHash(passwordEncoder.encode("Client123!"))
                .fullName("Client B")
                .role(Role.CLIENT)
                .enabled(true)
                .build());

        resource = resourceRepository.save(Resource.builder()
                .name("Cancha de prueba")
                .description("Resource de test de concurrencia")
                .category("CANCHA")
                .slotDurationMinutes(60)
                .cancellationWindowHours(24)
                .active(true)
                .managedBy(admin)
                .build());

        LocalDate targetDate = LocalDate.now().plusDays(7);
        contestedSlot = targetDate.atTime(10, 0);
        DayOfWeek dayOfWeek = targetDate.getDayOfWeek();

        availabilityRepository.save(Availability.builder()
                .resource(resource)
                .dayOfWeek(dayOfWeek)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .active(true)
                .build());
    }

    @AfterEach
    void tearDown() {
        reservationRepository.deleteAll();
        availabilityRepository.deleteAll();
        resourceRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void onlyOneOfTwoConcurrentReservationsForTheSameSlotSucceeds() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch readyLatch = new CountDownLatch(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        Callable<Object> attemptClientA = reservationAttempt(clientA.getId(), readyLatch, startLatch);
        Callable<Object> attemptClientB = reservationAttempt(clientB.getId(), readyLatch, startLatch);

        Future<Object> resultA = executor.submit(attemptClientA);
        Future<Object> resultB = executor.submit(attemptClientB);

        // Espera a que ambos hilos esten parados justo antes de reservar, y
        // los libera al mismo tiempo para maximizar la superposicion real.
        assertThat(readyLatch.await(5, TimeUnit.SECONDS)).isTrue();
        startLatch.countDown();

        Object outcomeA = resultA.get(10, TimeUnit.SECONDS);
        Object outcomeB = resultB.get(10, TimeUnit.SECONDS);
        executor.shutdownNow();

        List<Object> outcomes = List.of(outcomeA, outcomeB);
        long successCount = outcomes.stream().filter(o -> o instanceof Reservation).count();
        long conflictCount = outcomes.stream().filter(o -> o instanceof OverlappingReservationException).count();

        assertThat(successCount)
                .as("exactamente una de las dos reservas concurrentes debe tener exito")
                .isEqualTo(1);
        assertThat(conflictCount)
                .as("la otra debe fallar con OverlappingReservationException")
                .isEqualTo(1);

        List<Reservation> activeReservations = reservationRepository
                .findByResourceIdAndStatusInAndStartTimeBetween(
                        resource.getId(),
                        List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED),
                        contestedSlot.minusMinutes(1),
                        contestedSlot.plusMinutes(1));
        assertThat(activeReservations)
                .as("en BD debe quedar una unica reserva activa para ese slot, nunca dos")
                .hasSize(1);
    }

    /**
     * Envuelve la llamada al service en un Callable que espera en startLatch
     * para arrancar lo mas simultaneamente posible con el otro hilo, y
     * devuelve la Reservation si tuvo exito o la excepcion de dominio si
     * fallo (en vez de dejarla propagar, para poder inspeccionar ambos
     * resultados desde el hilo principal del test).
     */
    private Callable<Object> reservationAttempt(Long clientId, CountDownLatch readyLatch, CountDownLatch startLatch) {
        return () -> {
            readyLatch.countDown();
            startLatch.await();
            try {
                return reservationService.create(resource.getId(), clientId, contestedSlot);
            } catch (OverlappingReservationException ex) {
                return ex;
            }
        };
    }

    @Test
    void createsReservationSuccessfullyWhenSlotIsFree() {
        Reservation reservation = reservationService.create(resource.getId(), clientA.getId(), contestedSlot);

        assertThat(reservation.getId()).isNotNull();
        assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(reservation.getStartTime()).isEqualTo(contestedSlot);
    }

    @Test
    void rejectsReservationOutsideAvailabilityWindow() {
        LocalDateTime outsideWindow = contestedSlot.withHour(20);

        assertThrows(InvalidReservationException.class,
                () -> reservationService.create(resource.getId(), clientA.getId(), outsideWindow));
    }
}
