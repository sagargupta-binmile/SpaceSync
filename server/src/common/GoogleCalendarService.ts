import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  async createEvent(userTokens: { accessToken: string; refreshToken?: string }, eventData: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      access_token: userTokens.accessToken,
      refresh_token: userTokens.refreshToken || undefined,
    });
    oauth2Client.on('tokens', (newTokens) => {
      if (newTokens.refresh_token) {
        console.log('New refresh token received:', newTokens.refresh_token);
      }
      if (newTokens.access_token) {
        console.log('New access token received:', newTokens.access_token);
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: { dateTime: eventData.start, timeZone: 'Asia/Kolkata' },
        end: { dateTime: eventData.end, timeZone: 'Asia/Kolkata' },
        attendees: [{ email: eventData.attendeeEmail }],
        reminders: { useDefault: true },
      },
    });
  }
}
