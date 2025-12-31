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
