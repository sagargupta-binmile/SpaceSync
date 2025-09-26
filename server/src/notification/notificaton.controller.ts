import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { GoogleCalendarService } from 'src/common/GoogleCalendarService';


@Controller('notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly calendarService: GoogleCalendarService,
 
  ) {}

  @EventPattern('send_notification')
  async handleNotification(@Payload() data: any) {
    this.logger.log(` Received notification job: ${JSON.stringify(data)}`);

    try {
      switch (data.type) {
        case 'SLACK':
          await this.notificationService.sendBookingNotification(data);
          break;

        case 'CALENDAR':
          if (data.tokens?.accessToken) {
         
            await this.calendarService.createEvent(data.tokens, data.event);
          }
          break;

        case 'MAIL':
          
          break;

        default:
          this.logger.warn(` Unknown notification type: ${data.type}`);
      }
    } catch (err) {
      this.logger.error(` Failed to process notification: ${err.message}`, err.stack);
    }
  }
}
