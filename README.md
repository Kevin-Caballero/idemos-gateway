# Gateway Service

Puerta de entrada HTTP de iDemos. Actúa como API Gateway y BFF (Backend for Frontend): recibe las peticiones REST de la app móvil, valida el JWT y las reenvía al servicio correspondiente a través de RabbitMQ.

## Módulos

- **Auth** — registro, login y validación de tokens JWT.
- **BFF** — agrega y adapta las respuestas de los servicios internos (backend, AI, ETL) para la app.

## Comunicación

Expone la API HTTP en el puerto `PORT` (por defecto 3100). También escucha en la cola `gateway_queue` (RabbitMQ). Se comunica con Auth, Backend, AI y ETL a través de sus colas.

La documentación Swagger está disponible en `/api`.

## Variables de entorno

| Variable       | Por defecto             | Descripción                |
| -------------- | ----------------------- | -------------------------- |
| `PORT`         | `3100`                  | Puerto HTTP del servicio   |
| `JWT_SECRET`   | `secret`                | Secreto para validar JWTs  |
| `RABBITMQ_URL` | `amqp://localhost:5672` | URL de conexión a RabbitMQ |
| `NODE_ENV`     | —                       | Entorno de ejecución       |

## Required versions

| Tool / Package          | Version |
| ----------------------- | ------- |
| Node.js                 | >= 20.0 |
| npm                     | >= 10.0 |
| TypeScript              | ^5.7.3  |
| NestJS (`@nestjs/core`) | ^11.0.1 |
| `@nestjs/jwt`           | ^11.0.0 |
| `@nestjs/config`        | ^4.0.2  |
| `@nestjs/swagger`       | ^11.2.6 |
| `@nestjs/microservices` | ^11.0.1 |
| RxJS                    | ^7.8.1  |

> Node.js 20+ is required for native `.env` file loading via `--env-file`.

## Scripts

```bash
npm run start:dev   # development (watch mode)
npm run start:prod  # production
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
