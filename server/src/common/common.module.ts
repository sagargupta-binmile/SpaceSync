import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'src/users/users.module';

import { Booking } from 'src/bookings/entities/booking.entity';

import { LoggerService } from './logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { EmployeeSyncService } from './employee-sync.service';
import { RecurringBookingNotifier } from './recurringBookingNotifier.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [UsersModule, HttpModule, CacheModule.register(), TypeOrmModule.forFeature([Booking])],
  providers: [
    LoggerService,
    LoggingInterceptor,
    EmployeeSyncService,
    RecurringBookingNotifier,
    NotificationService,
  ],
  exports: [
    LoggerService,
    LoggingInterceptor,
    EmployeeSyncService,
    RecurringBookingNotifier,
    CacheModule.register(),
  ],
})
export class CommonModule {}
