import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, MoreThanOrEqual } from 'typeorm';
import { addDays, addWeeks, addMonths, differenceInDays, isSameDay, format } from 'date-fns';

import { Booking } from 'src/bookings/entities/booking.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RecurringBookingNotifier {
  private readonly logger = new Logger(RecurringBookingNotifier.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendRecurringBookingNotifications() {
    this.logger.log('Checking active recurring bookings...');

    const now = new Date();

    const activeRecurringBookings = await this.bookingRepository.find({
      where: {
        recurrenceRule: Not(IsNull()),
        deletedAt: IsNull(),
        recurrenceEndDate: MoreThanOrEqual(now),
      },
      relations: ['user', 'room'],
    });

    for (const booking of activeRecurringBookings) {
      await this.sendRecurringBookingNotification(booking);
    }
  }

  private async sendRecurringBookingNotification(booking: Booking) {
    if (!booking.recurrenceRule || !booking.recurrenceEndDate) return;

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (booking.deletedAt || startTime > now) return;

    let occurrenceStart = new Date(startTime);
    let occurrenceEnd = new Date(endTime);

    switch (booking.recurrenceRule) {
      case 'DAILY': {
        const days = differenceInDays(now, startTime);
        occurrenceStart = addDays(startTime, days);
        occurrenceEnd = addDays(endTime, days);
        break;
      }
      case 'WEEKLY': {
        const weeks = Math.floor(differenceInDays(now, startTime) / 7);
        occurrenceStart = addWeeks(startTime, weeks);
        occurrenceEnd = addWeeks(endTime, weeks);
        break;
      }
      case 'MONTHLY': {
        const months =
          (now.getFullYear() - startTime.getFullYear()) * 12 +
          (now.getMonth() - startTime.getMonth());
        occurrenceStart = addMonths(startTime, months);
        occurrenceEnd = addMonths(endTime, months);
        break;
      }
    }

 
    if (isSameDay(now, occurrenceStart)) {
      await this.notificationService.sendBookingNotification({
        recurrenceId:booking.recurrenceId as string,
        employeeName: booking.user?.name || 'Unknown',
        roomName: booking.room?.name || 'Room',
        startTime: occurrenceStart, 
        endTime: occurrenceEnd,
        channelId: booking.slackChannelId,
      });

      this.logger.log(
        `Recurring booking reminder sent for ${booking.room?.name} to ${booking.user?.name}`,
      );
    }
  }
}
