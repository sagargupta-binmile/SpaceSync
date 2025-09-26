import { Body, Controller, Post, Param } from '@nestjs/common';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  // Save subscription from frontend
  @Post('subscribe')
  async subscribe(
    @Body() subscription: any,
  ) {
    const userId='ccc76a07-6cf0-4c2e-9d27-ec96464b05f2'
    return this.pushService.saveSubscription(userId, subscription);
  }

  // Test endpoint to send notification
  @Post('notify/:userId')
  async notify(
    @Param('userId') userId: string,
    @Body() body: { title: string; message: string },
  ) {
    return this.pushService.sendNotification(userId, body);
  }
}
