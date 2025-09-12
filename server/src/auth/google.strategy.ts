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
      callbackURL: 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails[0].value;
    if (!email.endsWith('@binmile.com')) {
      // :x: Agar domain galat ho
      return done(null, {
        error: ':no_entry_symbol: Invalid Email Domain',
        message: 'Only company emails (@Admin Binmile.com) are allowed.',
      });
    }
    // :white_tick: Agar sahi email ho
    const user = await this.authService.loginWithGmail(email);
    done(null, user);
  }
}
