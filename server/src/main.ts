import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'notifications',
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://10.10.11.1:5173'],
    credentials: true,
  });

  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  await app.listen(4000, '0.0.0.0');
}
bootstrap();
