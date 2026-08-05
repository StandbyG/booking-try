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
endpoint de refresh). El interceptor de axios (punto 3) va a manejar un 401
limpiando la sesión y redirigiendo a `/login`, sin intentar un refresh
silencioso — decisión tomada explícitamente para no construir infraestructura
de refresh contra un backend que todavía no la tiene.

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
