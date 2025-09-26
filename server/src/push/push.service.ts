import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webPush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepo: Repository<PushSubscription>,
  ) {
  
    webPush.setVapidDetails(
      'mailto:shobhit@binmile.com',
      process.env.PUBLIC_KEY,
      process.env.PRIVATE_KEY,
    );
  }

  async saveSubscription(userId: string, subscription: any) {
  const existing = await this.subscriptionRepo.findOne({ where: { endpoint: subscription.endpoint } });
  if (existing) return existing;

  const entity = this.subscriptionRepo.create({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  return this.subscriptionRepo.save(entity);
}


  async sendNotification(userId: string, payload: any) {
  const sub = await this.subscriptionRepo.findOne({ where: { userId }, order: { id: 'DESC' } });
  if (!sub) return;

  try {
    await webPush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { auth: sub.auth, p256dh: sub.p256dh },
      },
      JSON.stringify(payload),
    );
  } catch (err) {
    this.logger.error(`Failed to send push notification: ${err.message}`);
    if (err.statusCode === 410 || err.statusCode === 404) {
      await this.subscriptionRepo.delete(sub.id);
    }
  }
}

}
