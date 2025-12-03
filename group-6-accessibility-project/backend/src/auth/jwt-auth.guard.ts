// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  // Delegates to passport, handles unauthorised errors consistently
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = (await super.canActivate(context)) as boolean;
    return activated;
  }

  // normalise passport response
  handleRequest(err: any, user: any, info: any) {
    if (err) throw err;
    if (!user) throw new UnauthorizedException(info?.message || 'Unauthorized');
    return user;
  }
}
