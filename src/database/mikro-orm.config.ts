import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export function buildDatabaseConfig({
  host,
  port,
  user,
  password,
  dbName,
  debug = false,
  maxPoolSize,
  idleTimeoutMillis,
  ssl = true,
}: {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
  debug?: boolean;
  maxPoolSize?: number;
  idleTimeoutMillis?: number;
  ssl?: boolean;
}): ReturnType<typeof defineConfig> {
  const highlighter = new SqlHighlighter();

  return defineConfig({
    driver: PostgreSqlDriver,
    host,
    port,
    user,
    password,
    dbName,
    debug,
    driverOptions: {
      connection: {
        ssl,
      },
    },
    pool: {
      min: 5,
      max: maxPoolSize,
      idleTimeoutMillis,
      acquireTimeoutMillis: 30000,
    },
    forceUtcTimezone: true,
    strict: true,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
      path: 'dist/database/migrations',
      pathTs: 'src/database/migrations',
      transactional: true,
      allOrNothing: true,
    },
    highlighter: debug ? highlighter : undefined,
  });
}

export default buildDatabaseConfig({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  dbName: process.env.DATABASE_NAME!,
});
