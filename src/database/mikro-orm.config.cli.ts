import { buildDatabaseConfig } from './mikro-orm.config';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: process.env.ENV_FILE_PATH ?? '.env' });

export default buildDatabaseConfig({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  dbName: process.env.DATABASE_NAME!,
});
