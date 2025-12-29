#!/bin/bash

set -e

# Update the password for the app_user
psql -U postgres -d audit_logs -c "ALTER ROLE app_user WITH PASSWORD '${POSTGRES_PASSWORD}';"

# Update the password for the app_migrate
psql -U postgres -d audit_logs -c "ALTER ROLE app_migrate WITH PASSWORD '${POSTGRES_PASSWORD}';"

echo "Database initialization complete."
