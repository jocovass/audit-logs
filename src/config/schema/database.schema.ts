import * as z from 'zod';

const DEFAULT_POOLSIZE = 40;
const DEFAULT_IDLE_TIMEOUT = 10000; // 10 seconds

export const databaseSchema = z.object({
  DATABASE_HOST: z.string().min(1, { message: 'Database host is required' }),
  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'Database port must be a valid number between 1 and 65535',
    }),
  DATABASE_USER: z
    .string()
    .min(1, { message: 'Database username is required' }),
  DATABASE_PASSWORD: z
    .string()
    .min(1, { message: 'Database password is required' }),
  DATABASE_NAME: z.string().min(1, { message: 'Database name is required' }),
  DATABASE_DEBUG_LOGGING: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(true),
  DATABASE_POOLSIZE: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_POOLSIZE))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Pool size must be a positive number',
    }),
  DATABASE_IDLE_TIMEOUT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_IDLE_TIMEOUT))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Idle timeout must be a non-negative number',
    }),
});

export type IDatabaseConfig = z.infer<typeof databaseSchema>;
