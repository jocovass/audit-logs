import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoadStrategy } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { IDatabaseConfig } from '../config/schema/database.schema';
import { buildDatabaseConfig } from './mikro-orm.config';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MikroOrmModule.forRootAsync({
          driver: PostgreSqlDriver,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<IDatabaseConfig, true>) => {
            const dbName = config.get('DATABASE_NAME', { infer: true });
            const host = config.get('DATABASE_HOST', { infer: true });
            const port = config.get('DATABASE_PORT', { infer: true });
            const user = config.get('DATABASE_USER', { infer: true });
            const password = config.get('DATABASE_PASSWORD', { infer: true });

            return {
              ...buildDatabaseConfig({
                dbName,
                host,
                port,
                user,
                password,
                debug: config.get('DATABASE_DEBUG_LOGGING', { infer: true }),
                ssl: config.get('DATABASE_SSL', { infer: true }),
                maxPoolSize: config.get('DATABASE_POOLSIZE', { infer: true }),
                idleTimeoutMillis: config.get('DATABASE_IDLE_TIMEOUT', {
                  infer: true,
                }),
              }),
              autoLoadEntities: true,
              loadStrategy: LoadStrategy.SELECT_IN,
            };
          },
        }),
      ],
    };
  }
}
