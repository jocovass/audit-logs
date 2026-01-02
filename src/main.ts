import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks. This ensures that any cleanup logic in
  // lifecycle hooks is executed on application shutdown. This is important
  // because MikroORM relies on these hooks to properly close database
  // connections and clean up resources.
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
});
