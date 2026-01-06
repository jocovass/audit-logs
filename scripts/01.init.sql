BEGIN;

------------------------
-- 1. Owner role
------------------------
-- Owns schemas & database objects
CREATE ROLE app_owner NOLOGIN;
COMMENT ON ROLE app_owner IS 'Owns database objects for the application';

------------------------
-- 2. Read-only role
------------------------
CREATE ROLE app_ro NOLOGIN;
COMMENT ON ROLE app_ro IS 'Read-only access role';

------------------------
-- 3. Read-write role
------------------------
CREATE ROLE app_rw NOLOGIN;
COMMENT ON ROLE app_rw IS 'Read and write access role';

------------------------
-- 4. Lock down public schema
------------------------
-- Prevent everyone from creating objects
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Allow usage
GRANT USAGE ON SCHEMA public TO app_ro, app_rw;

-- Only owner can create objects
GRANT CREATE ON SCHEMA public TO app_owner;

------------------------
-- 5. Default privileges (for future objects in ANY schema)
------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner
GRANT SELECT ON TABLES TO app_ro;

ALTER DEFAULT PRIVILEGES FOR ROLE app_owner
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE app_owner
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO app_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE app_owner
GRANT EXECUTE ON FUNCTIONS TO app_rw;

------------------------
-- 5b. Auto-grant schema usage on new schemas
------------------------
CREATE OR REPLACE FUNCTION grant_schema_permissions()
RETURNS event_trigger AS $$
DECLARE
    obj RECORD;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE SCHEMA'
    LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO app_ro, app_rw', obj.object_identity);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER auto_grant_schema_usage
ON ddl_command_end
WHEN TAG IN ('CREATE SCHEMA')
EXECUTE FUNCTION grant_schema_permissions();

------------------------
-- 6. Fix existing objects (important!)
------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;

GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_rw;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_rw;

------------------------
-- 7. Application users
------------------------

-- Runtime app user (no DDL)
CREATE USER app_user WITH LOGIN PASSWORD 'CHANGE_ME';
COMMENT ON ROLE app_user IS 'Runtime application user';
GRANT app_rw TO app_user;

-- Migration user (DDL allowed)
CREATE USER app_migrate WITH LOGIN PASSWORD 'CHANGE_ME';
COMMENT ON ROLE app_migrate IS 'Database migration user';
GRANT app_rw TO app_migrate;
GRANT app_owner TO app_migrate;

-- Automatically assume app_owner role on connection
-- This ensures all objects created by app_migrate are owned by app_owner,
-- which makes default privileges work correctly without SET ROLE in migrations
ALTER ROLE app_migrate SET ROLE app_owner;

------------------------
-- 8. Database-level permissions
------------------------
GRANT CONNECT ON DATABASE audit_logs TO app_user, app_migrate;
GRANT CREATE ON DATABASE audit_logs TO app_owner;

------------------------
-- 9. Allow postgres to SET ROLE (RDS-friendly)
------------------------
GRANT app_owner TO postgres;
GRANT app_rw TO postgres;
GRANT app_ro TO postgres;

COMMIT;

