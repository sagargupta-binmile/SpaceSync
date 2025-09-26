import { Injectable, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private slackClient: WebClient;
  private defaultChannel: string;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {
    this.slackClient = new WebClient(this.configService.get<string>('SLACK_BOT_TOKEN')!);
    this.defaultChannel = this.configService.get<string>('SLACK_DEFAULT_CHANNEL') || 'CHANNEL_ID';
  }

  async sendBookingNotification(data: {
    recurrenceId: string;
    employeeName: string;
    roomName: string;
    startTime: Date | string;
    endTime: Date | string;
    channelId?: string;
  }) {
    try {
      const channel = data.channelId || this.defaultChannel;

      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid startTime or endTime');
      }

      const message = ` ${data.employeeName}
      Hi All,
      Booking ${data.roomName} from ${format(start, 'hh:mm a')} to ${format(end, 'hh:mm a')}
      Thanks`;

      // Send to Slack
      const response = await this.slackClient.chat.postMessage({
        channel,
        text: message,
      });

      if (!response.ok) {
        this.logger.error('Slack API returned error', response);
        return;
      }

      const slackMessageTs = response.ts;
      await this.bookingRepository.update({ recurrenceId: data.recurrenceId }, { slackMessageTs });
    } catch (err) {
      this.logger.error('Error sending Slack notification', err);
    }
  }

  async deleteSlackMessage(slackChannelId: string, slackMessageTs: string) {
    if (slackMessageTs) {
      try {
        await this.slackClient.chat.delete({
          channel: slackChannelId || this.defaultChannel,
          ts: slackMessageTs,
        });
        this.logger.log(`Slack message deleted: ${slackMessageTs}`);
      } catch (error) {
        this.logger.error('Error deleting Slack message', error);
      }
    }
  }
}
