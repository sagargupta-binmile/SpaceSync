import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from 'src/users/users.module';
import { GoogleCalendarService } from 'src/common/GoogleCalendarService';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PushModule } from 'src/push/push.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    NotificationModule,
    UsersModule,
    PushModule,
    ClientsModule.register([
      {
        name: 'Notification_Service',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'notifications',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [BookingsService, GoogleCalendarService],
  controllers: [BookingsController],
  exports: [BookingsModule],
})
export class BookingsModule {}
