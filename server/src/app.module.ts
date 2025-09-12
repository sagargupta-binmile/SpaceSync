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
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    RoomsModule,
    BookingsModule,
    AuthModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    CommonModule,
    TypeOrmModule.forRoot(typeOrmModule),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
