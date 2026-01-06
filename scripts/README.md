# Set up database

The project uses PostgreSQL running inside a Docker container with the `17-alpine` base image.

When the container is run for the first time, it will create all the necessary database files inside the root of the project and load and execute the files under the `scripts` folder.

## Scripts

The scripts will create roles, users, the database, and the initial schema. The project follows the principle of least privilege to avoid granting too much access to users. Each user has limited access to prevent accidental or malicious actions.

The shell script connects to the database and updates user passwords. These passwords need to be added to your shell environment variables when running locally. In production, the same approach can be used, but you may want to consider other key management solutions based on your platform (e.g., AWS Secrets Manager, HashiCorp Vault, etc.).

## Environment Variables

Add the following environment variables to your `~/.zshrc` or `~/.bashrc` file so they can be referenced from `docker-compose.yml` and `scripts/02.init.sh`:

```env
# Database Container
POSTGRES_PASSWORD=postgres
POSTGRES_MIGRATE_PASSWORD=postgres
POSTGRES_ENV=development
```

After adding the variables, reload your shell configuration:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

## Running the Database

```bash
# Build and run the container for the first time
docker-compose up --build

# Run the container with attached output
docker-compose up

# Run the container in detached mode (background)
docker-compose up -d

# Stop the container
docker-compose down
```

## Roles and Users Architecture

The database follows a **role-based access control (RBAC)** pattern with clear separation of concerns. This approach adheres to the principle of least privilege.

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                      postgres                           │
│              (superuser, RDS-friendly)                  │
└────────────────────────┬────────────────────────────────┘
                         │ granted
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   app_owner   │ │    app_rw     │ │    app_ro     │
│   (NOLOGIN)   │ │   (NOLOGIN)   │ │   (NOLOGIN)   │
│               │ │               │ │               │
│ Owns objects  │ │ Read + Write  │ │  Read-only    │
│ CREATE schema │ │ CRUD tables   │ │ SELECT only   │
└───────┬───────┘ └───────┬───────┘ └───────────────┘
        │                 │
        │     ┌───────────┴───────────┐
        │     │                       │
        ▼     ▼                       ▼
┌─────────────────────┐     ┌─────────────────────┐
│    app_migrate      │     │     app_user        │
│      (LOGIN)        │     │      (LOGIN)        │
│                     │     │                     │
│ Inherits: app_owner │     │ Inherits: app_rw    │
│           app_rw    │     │                     │
│                     │     │                     │
│ Used for migrations │     │ Used at runtime     │
└─────────────────────┘     └─────────────────────┘
```

### Roles (NOLOGIN)

These are **group roles** that define permission sets. They cannot log in directly.

| Role        | Purpose               | Permissions                                                                                                        |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `app_owner` | Owns database objects | `CREATE` on schema, owns tables/sequences/functions                                                                |
| `app_rw`    | Read-write operations | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on tables; `USAGE`, `SELECT`, `UPDATE` on sequences; `EXECUTE` on functions |
| `app_ro`    | Read-only access      | `SELECT` on tables                                                                                                 |

### Users (LOGIN)

These are **login roles** that inherit permissions from group roles.

| User          | Inherits              | Purpose                                                                                |
| ------------- | --------------------- | -------------------------------------------------------------------------------------- |
| `app_user`    | `app_rw`              | Runtime application connections. Cannot create or modify schema.                       |
| `app_migrate` | `app_owner`, `app_rw` | Database migrations. Automatically assumes `app_owner` role on connection (see below). |

### How It Works

1. **Automatic Role Assumption**: `app_migrate` is configured with `ALTER ROLE app_migrate SET ROLE app_owner`. When it connects, PostgreSQL automatically switches to the `app_owner` role. This ensures all objects created during migrations are owned by `app_owner`—no manual `SET ROLE` needed in migration code.

2. **Default Privileges**: When `app_owner` creates new objects, permissions are automatically granted to `app_ro` and `app_rw` via `ALTER DEFAULT PRIVILEGES`.

3. **Schema Lockdown**: The `public` schema is locked down—only `app_owner` can create objects, while others have `USAGE` only.

4. **Password Management**: Initial passwords are placeholders (`CHANGE_ME`) and are updated by `02.init.sh` using environment variables.

### Pros

| Advantage                  | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| **Least Privilege**        | Runtime app cannot accidentally drop tables or modify schema |
| **Separation of Concerns** | Clear distinction between runtime operations and migrations  |
| **Auditability**           | Easy to track which user performed what actions              |
| **RDS/Cloud Compatible**   | Works with managed PostgreSQL services (AWS RDS, Azure, GCP) |
| **Scalable**               | Easy to add new roles (e.g., `app_reporting`, `app_admin`)   |
| **Automatic Permissions**  | New objects inherit correct permissions automatically        |

### Cons

| Disadvantage             | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Complexity**           | More initial setup compared to a single superuser                |
| **Role Management**      | Need to understand role inheritance and grants                   |
| **Migration Discipline** | Developers must ensure migrations run as `app_migrate`           |
| **Debugging**            | Permission errors can be confusing if roles aren't set correctly |

### Extending the Setup

#### Adding a Read-Only User (e.g., for reporting)

```sql
-- Create a new login user
CREATE USER app_reporting WITH LOGIN PASSWORD 'CHANGE_ME';
COMMENT ON ROLE app_reporting IS 'Reporting and analytics user';

-- Grant read-only role
GRANT app_ro TO app_reporting;

-- Allow database connection
GRANT CONNECT ON DATABASE audit_logs TO app_reporting;
```

#### Adding an Admin User (e.g., for on-call engineers)

```sql
-- Create admin user with elevated privileges
CREATE USER app_admin WITH LOGIN PASSWORD 'CHANGE_ME';
COMMENT ON ROLE app_admin IS 'Admin user for on-call operations';

-- Grant all roles
GRANT app_owner, app_rw, app_ro TO app_admin;

-- Allow database connection
GRANT CONNECT ON DATABASE audit_logs TO app_admin;
```

#### Adding a New Schema

When creating a new schema via migrations, you only need to grant `USAGE` on the schema. Since `app_migrate` automatically assumes `app_owner` on connection, and default privileges are set globally (not per-schema), table/sequence permissions are granted automatically.

**In a MikroORM migration:**

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration20260105080346 extends Migration {
  override up() {
    this.addSql(`CREATE SCHEMA IF NOT EXISTS audit`);
    this.addSql(`GRANT USAGE ON SCHEMA audit TO app_ro, app_rw`);
  }

  override down() {
    this.addSql(`DROP SCHEMA IF EXISTS audit CASCADE`);
  }
}
```

> **Note**: `GRANT USAGE ON SCHEMA` is required because there's no `ALTER DEFAULT PRIVILEGES` for schema-level access—it must be granted explicitly. Table and sequence permissions are handled automatically by the global default privileges defined in `01.init.sql`.

#### Adding a Service-Specific User

If you have multiple microservices, you may want dedicated users:

```sql
-- Service A: Full read-write
CREATE USER service_a WITH LOGIN PASSWORD 'CHANGE_ME';
GRANT app_rw TO service_a;
GRANT CONNECT ON DATABASE audit_logs TO service_a;

-- Service B: Read-only access
CREATE USER service_b WITH LOGIN PASSWORD 'CHANGE_ME';
GRANT app_ro TO service_b;
GRANT CONNECT ON DATABASE audit_logs TO service_b;
```

### Best Practices

1. **Never use `postgres` superuser** in application code
2. **Rotate passwords** regularly in production
3. **Use environment variables** or secrets management for passwords
4. **Run migrations in CI/CD** with `app_migrate`, not manually
5. **Audit role grants** periodically with:
   ```sql
   SELECT r.rolname, ARRAY_AGG(m.rolname) AS member_of
   FROM pg_roles r
   JOIN pg_auth_members am ON r.oid = am.member
   JOIN pg_roles m ON am.roleid = m.oid
   WHERE r.rolname LIKE 'app_%'
   GROUP BY r.rolname;
   ```
