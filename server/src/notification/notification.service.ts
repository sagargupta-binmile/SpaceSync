import { Injectable, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private slackClient: WebClient;
  private defaultChannel: string;

  constructor(private configService: ConfigService) {
    this.slackClient = new WebClient(this.configService.get<string>('SLACK_BOT_TOKEN')!);
    this.defaultChannel = this.configService.get<string>('SLACK_DEFAULT_CHANNEL') || 'CHANNEL_ID';
  }

  async sendBookingNotification(data: {
    employeeName: string;
    roomName: string;
    startTime: string;
    endTime: string;
    channelId?: string;
  }) {
    try {
      const channel = data.channelId || this.defaultChannel;
      const message = `📢 *Room Booking Alert:* ${data.roomName} booked from *${data.startTime}* to *${data.endTime}* by *${data.employeeName}*. Please update your schedules accordingly.`;

      const result = await this.slackClient.chat.postMessage({
        channel,
        text: message,
      });

      this.logger.log(`Slack notification sent: ${result.ts}`);
    } catch (error) {
      this.logger.error('Error sending Slack notification', error);
    }
  }
}
