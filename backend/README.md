# Booking Engine

Motor de reservas/turnos para negocios con recursos limitados (canchas, consultorios,
salones de belleza, etc). Previene doble-reserva (overbooking) incluso ante requests
concurrentes. Proyecto de portafolio: prioriza arquitectura limpia y código
production-ready por sobre features adicionales.

## Stack

- Java 21, Spring Boot 3.3.5
- Spring Data JPA + PostgreSQL 16
- Spring Security con JWT (jjwt)
- Bean Validation
- Flyway (migraciones versionadas)
- MapStruct (mapeo entity <-> DTO) + Lombok
- springdoc-openapi (Swagger UI)
- JUnit 5 + Testcontainers (tests de integración con Postgres real)

## Arquitectura y decisiones de diseño

**Estructura por capas** (`controller / service / repository / entity / dto / mapper /
exception / security / config`) en vez de por feature: con 4 entidades y el alcance
actual, la navegabilidad para quien revisa el código pesa más que el aislamiento de
módulos que da feature-based. Si el proyecto creciera a 10+ entidades, reconsideraría.

**Prevención de doble-booking — lock pesimista, no `@Version` optimista.**
El conflicto real es entre dos **inserts** de filas nuevas compitiendo por el mismo
`(resource_id, start_time)`, no una actualización concurrente de una fila existente
(que es el caso que resuelve `@Version`). La estrategia usada (ver
[`ReservationServiceImpl`](src/main/java/com/portfolio/booking/service/impl/ReservationServiceImpl.java)):

1. `SELECT ... FOR UPDATE` sobre la fila del `Resource` al crear una reserva
   ([`ResourceRepository.findByIdForUpdate`](src/main/java/com/portfolio/booking/repository/ResourceRepository.java)),
   que serializa la sección crítica "verificar slot libre → insertar" entre
   transacciones concurrentes para ese resource (sin bloquear reservas de otros
   resources).
2. Como red de seguridad en BD: un índice `UNIQUE` parcial sobre
   `(resource_id, start_time) WHERE status IN ('PENDING','CONFIRMED')`
   ([`V4__create_reservations_table.sql`](src/main/resources/db/migration/V4__create_reservations_table.sql)).
   Funciona sin falsos positivos porque los slots tienen duración fija y alineada
   (`Resource.slotDurationMinutes`): dos reservas del mismo resource nunca se
   solapan parcialmente, o coinciden exactamente en `start_time` o no se tocan.

Validado con un test de integración con Testcontainers que dispara dos reservas
concurrentes reales (hilos + `CountDownLatch`) al mismo slot y verifica que solo una
tenga éxito
([`ReservationConcurrencyIntegrationTest`](src/test/java/com/portfolio/booking/integration/ReservationConcurrencyIntegrationTest.java)).

**Multi-tenancy: single-tenant con seam de escalabilidad.** No hay una entidad
`Business`/`Organization` (no estaba en el alcance mínimo pedido), pero
`Resource.managedBy` ya modela "qué admin administra este recurso" en vez de asumir
un único admin global, dejando un punto de extensión natural para multi-tenant real
sin rediseñar el dominio.

**`User` no implementa `UserDetails`.** Ese acoplamiento a Spring Security vive en
[`UserPrincipal`](src/main/java/com/portfolio/booking/security/UserPrincipal.java),
que envuelve la entidad de dominio.

## Modelo de dominio

- **User**: clientes y administradores (`role`: `ADMIN` | `CLIENT`).
- **Resource**: recurso reservable. Incluye `slotDurationMinutes` (duración fija de
  slot) y `cancellationWindowHours` (ventana mínima de cancelación, configurable por
  recurso).
- **Availability**: regla de disponibilidad **semanal recurrente**
  (`dayOfWeek` + `startTime`/`endTime`), no fechas puntuales.
- **Reservation**: reserva de un slot concreto. Estados: `PENDING`, `CONFIRMED`,
  `CANCELLED`, `COMPLETED`.

## Cómo correr localmente

### Prerrequisitos

- **JDK 21** (no una versión más nueva: al momento de escribir esto, JDK 26 rompe
  Lombok). En macOS con Homebrew: `brew install openjdk@21`, luego apuntar
  `JAVA_HOME` a `/opt/homebrew/Cellar/openjdk@21/<version>/libexec/openjdk.jdk/Contents/Home`.
- Docker (para Postgres vía `docker-compose` y para los tests de integración con
  Testcontainers).

### Levantar Postgres

```bash
docker compose up -d
```

Expone Postgres en el puerto **5433** del host (no 5432): evita chocar con una
instancia de Postgres nativa que ya podrías tener corriendo localmente para otro
proyecto. Si tu máquina tiene el 5432 libre, podés sobreescribirlo con
`DB_PORT=5432 docker compose up -d`.

### Levantar la aplicación

```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/<version>/libexec/openjdk.jdk/Contents/Home
mvn spring-boot:run
```

Flyway corre las migraciones automáticamente al arrancar. La API queda en
`http://localhost:8080`.

### Usuario admin por defecto

Sembrado por la migración `V5__seed_default_admin.sql` (el registro público
`/api/v1/auth/register` siempre crea `CLIENT`; no hay forma de auto-promocionarse a
`ADMIN` vía API):

```
email:    admin@booking.local
password: Admin123!
```

### Documentación de la API

Swagger UI: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### CORS

Los orígenes permitidos se configuran vía `booking.cors.allowed-origins`
(`application.yml`) o la variable de entorno `CORS_ALLOWED_ORIGINS` (coma-
separado si son varios). Por defecto: `http://localhost:5173` (dev server de
Vite del frontend). Si el frontend corre en otro puerto/host, hay que
ajustarlo o las llamadas del navegador van a fallar por CORS.

### Tests

```bash
mvn test
```

Los tests de integración levantan un Postgres real vía Testcontainers (requiere
Docker corriendo). El test central,
`ReservationConcurrencyIntegrationTest.onlyOneOfTwoConcurrentReservationsForTheSameSlotSucceeds`,
verifica el requisito de no-overbooking bajo concurrencia real.

## Endpoints principales

| Método | Path                                          | Rol         | Descripción                          |
|--------|-----------------------------------------------|-------------|---------------------------------------|
| POST   | `/api/v1/auth/register`                       | público     | Registro (siempre crea CLIENT)        |
| POST   | `/api/v1/auth/login`                          | público     | Login, devuelve JWT                   |
| POST   | `/api/v1/resources`                           | ADMIN       | Crear resource                        |
| GET    | `/api/v1/resources`                           | autenticado | Listar resources activos              |
| GET    | `/api/v1/resources/all`                       | ADMIN       | Listar todos los resources (incl. inactivos) |
| PUT    | `/api/v1/resources/{id}`                      | ADMIN       | Actualizar resource                   |
| DELETE | `/api/v1/resources/{id}`                      | ADMIN       | Desactivar resource                   |
| POST   | `/api/v1/resources/{id}/availabilities`       | ADMIN       | Definir disponibilidad semanal        |
| GET    | `/api/v1/resources/{id}/availabilities`       | autenticado | Listar disponibilidad                 |
| GET    | `/api/v1/resources/{id}/slots?from=&to=`      | autenticado | Slots disponibles en un rango de fechas|
| POST   | `/api/v1/reservations`                        | autenticado | Crear reserva (para el usuario logueado)|
| POST   | `/api/v1/reservations/{id}/cancel`            | dueño/ADMIN | Cancelar reserva (respeta ventana)     |
| GET    | `/api/v1/reservations/me`                     | autenticado | Mis reservas                          |
| GET    | `/api/v1/resources/{id}/reservations`         | ADMIN       | Reservas de un resource                |

## Estructura de carpetas

```
src/main/java/com/portfolio/booking/
├── controller/       # Endpoints REST
├── service/          # Interfaces de casos de uso
│   ├── impl/          # Implementaciones
│   └── model/          # Value objects internos (TimeSlot, AuthResult)
├── repository/       # Spring Data JPA
├── entity/            # Entidades JPA
├── dto/
│   ├── request/       # DTOs de entrada (con Bean Validation)
│   └── response/      # DTOs de salida
├── mapper/            # MapStruct
├── security/           # JWT, UserPrincipal, SecurityConfig
├── exception/          # Excepciones de dominio + GlobalExceptionHandler
└── config/             # OpenAPI, etc.

src/main/resources/db/migration/   # Migraciones Flyway (V1..V5)
src/test/java/.../integration/     # Tests con Testcontainers
```
