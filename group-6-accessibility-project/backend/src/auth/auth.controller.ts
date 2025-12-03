import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ConflictException,
  BadRequestException,
  UseGuards,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private databaseService: DatabaseService
  ) { }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    try {
      return await this.authService.register(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req) {
    // Get fresh user data with updated role
    const user = await this.databaseService.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new token with updated user info
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role // This will now be 'PUBLISHER'
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }
}