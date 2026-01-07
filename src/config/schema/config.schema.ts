import * as z from 'zod';
import { appSchema } from './app.schema';
import { databaseSchema } from './database.schema';

export const configSchema = z.object({
  ...appSchema.shape,
  ...databaseSchema.shape,
});
