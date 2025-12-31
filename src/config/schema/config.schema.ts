import * as z from 'zod';
import { databaseSchema } from './database.schema';

export const configSchema = z.object({
  ...databaseSchema.shape,
});
