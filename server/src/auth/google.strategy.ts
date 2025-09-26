import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile','https://www.googleapis.com/auth/calendar.events'],
      accessType: 'offline',
      prompt: 'consent', 
    });
  }

async validate(
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: VerifyCallback,
) {
  const email = profile.emails[0].value;

  if (!email.endsWith('@binmile.com')) {
    return done(null, {
      error: ':no_entry_symbol: Invalid Email Domain',
      message: 'Only company emails are allowed.',
    });
  }


  const userJwt = await this.authService.loginWithGmail(
    email,
    accessToken,
    refreshToken,
  );

  done(null, userJwt);
}

}
