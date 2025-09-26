import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModule } from './config/ormconfig';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { NotificationController } from './notification/notificaton.controller';
import { PushModule } from './push/push.module';
const envSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  CACHE_TTL: Joi.number().default(3600),

  SLACK_BOT_TOKEN: Joi.string().required(),
  SLACK_SIGNING_SECRET: Joi.string().required(),
  SLACK_DEFAULT_CHANNEL: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_DOMAIN: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),

  RMS_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema,
    }),

    UsersModule,
    RoomsModule,
    BookingsModule,
    AuthModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    CommonModule,
    TypeOrmModule.forRoot(typeOrmModule),
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
