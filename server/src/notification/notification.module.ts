// notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notificaton.controller'; 
import { Booking } from 'src/bookings/entities/booking.entity';
import { GoogleCalendarService } from 'src/common/GoogleCalendarService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]) 
  ],
  controllers: [NotificationController],
  providers: [NotificationService,GoogleCalendarService],
  exports: [NotificationService],
})
export class NotificationModule {}
