// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("ERROR: process.env.JWT_SECRET is NOT set!");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret!, // MUST MATCH JwtModule secret
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
