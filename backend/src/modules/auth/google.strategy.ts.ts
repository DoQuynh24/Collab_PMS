import { Injectable } from '@nestjs/common';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(GoogleStrategy, 'google') {
   constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration in .env');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { email, givenName, familyName } = profile._json;
    const fullName = `${givenName} ${familyName || ''}`.trim();
    const googleId = profile.id;

    let user = await this.authService.findByGoogleId(googleId);
    if (!user) {
      user = await this.authService.createUser({
        name: fullName,
        email,
        google_id: googleId,
      });
    }

    done(null, user);
  }
}