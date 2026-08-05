# Booking Frontend

Frontend del motor de reservas. Consume la API en [`../backend`](../backend/README.md)
(Spring Boot + JWT). Proyecto de portafolio: prioriza código limpio y tipos
compartibles por sobre atajos.

## Stack

- Vite + React 18 + TypeScript
- TanStack Query (fetching/cache de datos del servidor)
- React Router v6
- React Hook Form + Zod (formularios y validación)
- Zustand (estado global: sesión JWT)
- Tailwind CSS v4 + shadcn/ui (preset "Nova", base Radix)
- Axios con interceptor de auth

## Setup (punto 1 — completado)

- Vite + React 18 + TypeScript, con `@/*` apuntando a `src/*` (mismo alias en
  `tsconfig` y `vite.config.ts`, requerido por shadcn/ui).
- Tailwind CSS v4 vía `@tailwindcss/vite` (sin `tailwind.config.js`: la
  configuración vive en `src/index.css` con `@theme`, como es estándar en v4).
- shadcn/ui inicializado (`components.json`, `src/lib/utils.ts`,
  `src/components/ui/button.tsx` de ejemplo).
- ESLint 9 (flat config) con soporte de React Hooks / React Refresh.
- Estructura de carpetas por feature (ver abajo), con `.gitkeep` en las que
  todavía no tienen contenido — se van a ir llenando en los próximos puntos.

### Decisión: sesión sin refresh token

El backend actual solo emite un `accessToken` de corta duración (no hay
endpoint de refresh). El interceptor de axios maneja un 401 limpiando la
sesión y redirigiendo a `/login`, sin intentar un refresh silencioso —
decisión tomada explícitamente para no construir infraestructura de refresh
contra un backend que todavía no la tiene.

## Cliente API y tipos base (punto 2 — completado)

- `src/types/`: interfaces TypeScript que reflejan 1:1 los DTOs del backend
  (`UserResponse`, `AuthResponse`, `ResourceResponse`, `AvailabilityResponse`,
  `ReservationResponse`, `TimeSlotResponse`, `ApiErrorResponse`, etc). Sin
  dependencias de React — portables a un paquete compartido.
- `src/lib/auth-token.ts`: única fuente de verdad del token/usuario en
  `localStorage`, deliberadamente fuera de React/Zustand. Tanto el
  interceptor de axios como el store de Zustand (próximo punto) leen/escriben
  acá, evitando un ciclo de importación entre `lib/` y `store/`.
- `src/lib/axios.ts`: instancia de axios con `baseURL` desde
  `VITE_API_BASE_URL`. Interceptor de request adjunta `Authorization: Bearer`;
  interceptor de response, ante un 401, limpia la sesión y hace un
  hard-redirect a `/login` (fuera del árbol de React, por eso no usa
  `useNavigate`).
- `src/lib/api-error.ts`: helpers para extraer un mensaje legible (y los
  `validationErrors` de campo) de cualquier error de axios, para usar en
  toasts y en `setError` de React Hook Form.
- `src/api/*.api.ts`: funciones tipadas por recurso (`auth`, `resources`,
  `availability`, `reservations`) sobre la instancia de axios.

Verificado con un smoke test real (login contra el backend corriendo +
request autenticado) via un script de Playwright — en el camino encontré y
arreglé un bug real: el backend no tenía **CORS** configurado, así que el
navegador bloqueaba todas las llamadas desde `localhost:5173`. Se agregó
`SecurityConfig.corsConfigurationSource()` en el backend, configurable vía
`booking.cors.allowed-origins` / `CORS_ALLOWED_ORIGINS`.

## Auth store + login/registro + rutas protegidas (punto 3 — completado)

- `src/store/auth.store.ts`: store de Zustand, wrapper reactivo sobre
  `lib/auth-token.ts` (que sigue siendo la fuente de verdad real). Se
  inicializa leyendo `localStorage` para no perder la sesión en un refresh
  de página.
- `src/features/auth/`: `schemas.ts` (Zod, reflejan las validaciones del
  backend: password min 8, email válido, etc), `hooks.ts` (mutations de
  TanStack Query para login/register que llaman a `authStore.setSession` en
  `onSuccess`), `LoginForm.tsx` / `RegisterForm.tsx` (React Hook Form +
  shadcn `Form`), y sus páginas.
- `src/routes/`: `ProtectedRoute` (redirige a `/login` si no hay sesión, y
  opcionalmente exige un rol) y `PublicOnlyRoute` (si ya hay sesión, saca a
  quien visita `/login` o `/register`). `AppLayout` (header con nombre/rol
  del usuario y logout) y `AuthLayout` (card centrada) como layouts.
- `src/lib/api-error.ts` ganó `applyValidationErrors`, que mapea los
  `validationErrors` de un 400 del backend a los campos del formulario via
  `setError` de React Hook Form (usado en `RegisterForm`).
- Notificaciones con `sonner` (shadcn `Toaster`), montado una sola vez en
  `App.tsx`.

Verificado con un flujo completo end-to-end en el navegador (Playwright):
visita sin sesión → redirect a `/login`; registro → redirect a `/` protegida;
visitar `/login` estando logueado → redirect a `/`; logout → `/login`; login
de nuevo; password incorrecta → toast de error sin navegar. En el camino
encontré y arreglé otro bug real: los componentes `Input` y `Button` de
shadcn se generan sin `forwardRef` (asumen React 19, donde `ref` es una prop
normal en componentes función); con React 18 eso rompía el registro de
inputs de React Hook Form (`"Function components cannot be given refs"`).
Se agregó `React.forwardRef` explícito a ambos.

## Estructura de carpetas

```
src/
├── api/          # Clientes de API por recurso (auth.api.ts, resources.api.ts, ...)
├── components/
│   ├── ui/        # Componentes de shadcn/ui (generados, no editar a mano el core)
│   └── shared/    # Componentes propios reutilizables
├── features/      # Logica por dominio: auth, resources, reservations, admin
├── hooks/         # Hooks genericos
├── lib/           # utils.ts (shadcn), cliente axios, schemas de Zod compartidos
├── routes/        # Definicion de rutas y layouts (React Router)
├── store/         # Stores de Zustand
└── types/         # Tipos compartidos / DTOs que reflejan las entidades del backend
```

`types/` y los schemas de Zod en `lib/` se mantienen libres de imports de
React a propósito, para poder moverlos a un paquete compartido si más
adelante se arma un monorepo con Turborepo (ej. para una app React Native).

## Cómo correr

```bash
npm install
cp .env.example .env   # ajustar VITE_API_BASE_URL si el backend no corre en localhost:8080
npm run dev
```

Requiere el backend corriendo (ver [`../backend/README.md`](../backend/README.md))
para que cualquier feature que llame a la API funcione.

```bash
npm run build   # build de produccion
npm run lint    # ESLint
```
