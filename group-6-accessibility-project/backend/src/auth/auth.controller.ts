import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  ValidationPipe,
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}