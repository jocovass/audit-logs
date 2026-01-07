import * as z from 'zod';

export const appSchema = z.object({
  CHECKSUM_HASH_SECRET: z.string().min(1, 'CHECKSUM_HASH_SECRET is required'),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),
});

export type IAppConfig = z.infer<typeof appSchema>;
