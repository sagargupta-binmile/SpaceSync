import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173', // your React frontend
    credentials: true,
  });
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  await app.listen(4000);
}
bootstrap();
