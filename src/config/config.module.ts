import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configSchema } from './schema/config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      cache: true,
      validationSchema: configSchema,
    }),
  ],
  providers: [],
  exports: [],
})
export class ConfigModule {}
