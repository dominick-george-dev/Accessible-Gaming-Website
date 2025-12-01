// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  
  imports: [
    DatabaseModule,

    // Must set defaultStrategy:'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // IMPORTANT: we validate the secret and ensure Nest never receives undefined
    JwtModule.register({
      secret: process.env.JWT_SECRET,   // <--- FIX
      signOptions: { expiresIn: '24h' },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  exports: [
    AuthService,
    JwtModule,          // MUST export so JwtStrategy shares same instance
    JwtStrategy,
    PassportModule,
  ],
}
)
export class AuthModule {}

