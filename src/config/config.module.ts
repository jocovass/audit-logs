import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './schema/config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      cache: true,
      validate: (config) => {
        const result = configSchema.safeParse(config);
        if (!result.success) {
          // FIXME: Improve error message
          // const errors = result.error;
          throw new Error('Config validation error');
        }
        return result.data;
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class ConfigModule {}
