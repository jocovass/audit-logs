# Audit Logging Service

A standalone audit logging service built with NestJS 11 and MikroORM (PostgreSQL), designed to practice SOLID principles.

---

## Overview

| Feature               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| **Event Ingestion**   | Receive audit events via HTTP, Webhooks, or Message Queues |
| **Validation**        | Normalize and validate incoming data                       |
| **Immutable Storage** | Store audit logs that cannot be modified or deleted        |
| **Query API**         | REST API with filtering, pagination, and search            |
| **Dashboard**         | Timeline view, filters, and analytics graphs               |

---

## Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | NestJS 11                           |
| ORM           | MikroORM 6                          |
| Database      | PostgreSQL 16                       |
| Validation    | class-validator + class-transformer |
| API Docs      | Swagger (OpenAPI)                   |
| Message Queue | BullMQ (Redis) - _Phase 2_          |
| Testing       | Jest                                |

---

## SOLID Principles Applied

| Principle                 | How We Apply It                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S**ingle Responsibility | Each service does ONE thing: `AuditLogService` handles business logic, `AuditLogRepository` handles persistence, `EventNormalizerService` handles data transformation |
| **O**pen/Closed           | New event sources (HTTP, Webhook, Queue) can be added without modifying existing code — they all implement `IEventSource`                                             |
| **L**iskov Substitution   | Any `IEventSource` implementation can replace another; any `IStorageProvider` can be swapped (Postgres → MongoDB)                                                     |
| **I**nterface Segregation | Small, focused interfaces: `IAuditLogRepository` (CRUD), `IEventValidator` (validation), `IEventNormalizer` (transformation)                                          |
| **D**ependency Inversion  | Services depend on interfaces (abstractions), not concrete classes. Repository interface injected via NestJS DI                                                       |

---

## Audit Log Schema (Industry Standard)

```typescript
interface AuditLog {
  // Identity
  id: string; // UUID v7 (time-sortable)
  correlationId?: string; // Links related events

  // Timing
  timestamp: Date; // When event occurred
  receivedAt: Date; // When service received it

  // Actor (Who)
  actor: {
    id: string; // User/system ID
    type: 'user' | 'system' | 'api_key';
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  };

  // Action (What)
  action: string; // CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.
  category: string; // authentication, data_access, admin, etc.

  // Resource (On What)
  resource: {
    type: string; // user, order, document, etc.
    id: string;
    name?: string;
  };

  // Changes (For mutations)
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };

  // Context
  source: string; // web, api, webhook, queue
  metadata?: Record<string, unknown>;

  // Integrity
  checksum: string; // SHA-256 hash for immutability verification
}
```

---

## Project Structure

```
src/
├── main.ts                           # Bootstrap application
├── app.module.ts                     # Root module
│
├── common/                           # Shared utilities
│   ├── interfaces/
│   │   ├── repository.interface.ts         # Base repository contract
│   │   ├── event-source.interface.ts       # Event source contract
│   │   └── event-normalizer.interface.ts   # Normalizer contract
│   ├── decorators/
│   │   └── audit-actor.decorator.ts        # Extract actor from request
│   ├── filters/
│   │   └── http-exception.filter.ts        # Global error handling
│   ├── pipes/
│   │   └── validation.pipe.ts              # Global validation
│   └── utils/
│       └── checksum.util.ts                # SHA-256 hashing
│
├── config/                           # Configuration (S: Single Responsibility)
│   ├── config.module.ts
│   ├── database.config.ts
│   └── app.config.ts
│
├── audit-logs/                       # Core Domain Module
│   ├── audit-logs.module.ts
│   │
│   ├── entities/
│   │   └── audit-log.entity.ts             # MikroORM entity
│   │
│   ├── dto/
│   │   ├── create-audit-log.dto.ts         # Input validation
│   │   ├── query-audit-logs.dto.ts         # Query parameters
│   │   └── audit-log-response.dto.ts       # Output shape
│   │
│   ├── interfaces/
│   │   └── audit-log-repository.interface.ts  # (D: Dependency Inversion)
│   │
│   ├── repositories/
│   │   └── audit-log.repository.ts         # MikroORM implementation
│   │
│   ├── services/
│   │   ├── audit-log.service.ts            # Business logic
│   │   └── checksum.service.ts             # Integrity verification
│   │
│   └── controllers/
│       └── audit-logs.controller.ts        # REST API endpoints
│
├── ingestion/                        # Event Ingestion Module (O: Open/Closed)
│   ├── ingestion.module.ts
│   │
│   ├── interfaces/
│   │   └── event-source.interface.ts       # Contract for all sources
│   │
│   ├── controllers/
│   │   ├── http-events.controller.ts       # POST /events
│   │   └── webhook.controller.ts           # POST /webhooks/:provider
│   │
│   ├── services/
│   │   ├── event-normalizer.service.ts     # Transform to standard format
│   │   └── event-validator.service.ts      # Validate incoming events
│   │
│   └── processors/                         # Phase 2: Message Queues
│       └── queue-event.processor.ts
│
└── dashboard/                        # Dashboard & Analytics Module
    ├── dashboard.module.ts
    │
    ├── controllers/
    │   └── dashboard.controller.ts         # GET /dashboard/*
    │
    └── services/
        ├── analytics.service.ts            # Aggregations & stats
        └── timeline.service.ts             # Time-based queries
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [x] Set up MikroORM with PostgreSQL
  - [ ] Might need to add a standalone config for CLI migrations

    ```bash
      # Example
      import 'dotenv/config';
      import { buildDatabaseConfig } from './mikro-orm.config';

      export default buildDatabaseConfig({
        host: process.env.DATABASE_HOST!,
        port: parseInt(process.env.DATABASE_PORT!, 10),
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        dbName: process.env.DATABASE_NAME!,
        debug: process.env.DATABASE_DEBUG_LOGGING === 'true',
        ssl: process.env.DATABASE_SSL !== 'false',
      });

      # package.json
      {
        "mikro-orm": {
          "useTsNode": true,
          "configPaths": ["./src/database/mikro-orm.cli.config.ts"]
        }
      }
    ```

  - [ ] SSL option might need more granualar control e.g. `rejectUnauthorized`

- [x] Create configuration module
- [ ] Define core interfaces (repository, event source)
- [ ] Implement AuditLog entity
- [ ] Create DTOs with validation
- [ ] Build AuditLogRepository (implements interface)
- [ ] Implement AuditLogService
- [ ] Add checksum generation for immutability

### Phase 2: Event Ingestion (Week 2)

- [ ] Create ingestion module
- [ ] Build HTTP events controller (POST /events)
- [ ] Build webhook controller (POST /webhooks/:provider)
- [ ] Implement EventNormalizerService
- [ ] Add EventValidatorService
- [ ] Support multiple webhook formats (GitHub, Stripe, custom)

### Phase 3: Query API (Week 3)

- [ ] Build audit-logs controller with full CRUD (except UPDATE/DELETE)
- [ ] Implement filtering (by actor, action, resource, date range)
- [ ] Add pagination (cursor-based for large datasets)
- [ ] Add full-text search on metadata
- [ ] Generate Swagger documentation

### Phase 4: Dashboard & Analytics (Week 4)

- [ ] Create dashboard module
- [ ] Implement timeline aggregation (events per hour/day)
- [ ] Add analytics service (top actors, common actions)
- [ ] Build category breakdown endpoints

### Phase 5: Message Queues (Week 5)

- [ ] Add BullMQ integration
- [ ] Create queue processor for async event handling
- [ ] Implement retry logic for failed events
- [ ] Add dead-letter queue for unprocessable events

### Phase 6: Production Hardening (Week 6)

- [ ] Add authentication (API keys or JWT)
- [ ] Implement rate limiting
- [ ] Add database indexes for query performance
- [ ] Create Docker Compose setup
- [ ] Write comprehensive tests

---

## API Endpoints

### Event Ingestion

| Method | Endpoint              | Description                           |
| ------ | --------------------- | ------------------------------------- |
| `POST` | `/events`             | Ingest a single audit event           |
| `POST` | `/events/batch`       | Ingest multiple events                |
| `POST` | `/webhooks/:provider` | Receive webhook from external service |

### Audit Logs Query

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| `GET`  | `/audit-logs`        | List logs with filtering |
| `GET`  | `/audit-logs/:id`    | Get single log by ID     |
| `GET`  | `/audit-logs/search` | Full-text search         |
| `GET`  | `/audit-logs/export` | Export logs as CSV/JSON  |

### Dashboard

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| `GET`  | `/dashboard/timeline`   | Events over time   |
| `GET`  | `/dashboard/stats`      | Summary statistics |
| `GET`  | `/dashboard/top-actors` | Most active actors |
| `GET`  | `/dashboard/actions`    | Action breakdown   |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm mikro-orm migration:up

# Start development server
pnpm start:dev
```

### Environment Variables

```env
# Database Container
POSTGRES_PASSWORD=postgres
POSTGRES_MIGRATE_PASSWORD=postgres
POSTGRES_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=audit_logs
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Application
PORT=3000
NODE_ENV=development

# Redis (Phase 2)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Dependencies to Install

```bash
# Core
pnpm add @nestjs/config

# MikroORM
pnpm add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql @mikro-orm/migrations

# Validation
pnpm add class-validator class-transformer

# API Documentation
pnpm add @nestjs/swagger

# Utilities
pnpm add uuid

# Dev dependencies
pnpm add -D @mikro-orm/cli
```

---

## Learning Resources

### NestJS

- [Official Docs](https://docs.nestjs.com/)
- [NestJS Fundamentals Course](https://courses.nestjs.com/)

### MikroORM

- [Official Docs](https://mikro-orm.io/docs)
- [NestJS Integration](https://mikro-orm.io/docs/usage-with-nestjs)

### SOLID Principles

- [SOLID in TypeScript](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

---

## Notes

- **Immutability**: Audit logs should NEVER be updated or deleted. The repository will only expose `create()` and `find*()` methods.
- **Checksums**: Each log entry gets a SHA-256 checksum of its content. This allows verification that logs haven't been tampered with.
- **Correlation IDs**: Use these to link related events (e.g., a user session, a transaction flow).
