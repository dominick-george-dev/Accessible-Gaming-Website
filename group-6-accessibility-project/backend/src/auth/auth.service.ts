import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { roles } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  // Hash password with high security (12 rounds)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; 
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password against hash
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async register(username: string, email: string, password: string) {

    const normalizedEmail = email.toLowerCase().trim();
    // Check if user already exists with this email
    const existingUserByEmail = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if user already exists with this username
    const existingUserByUsername = await this.databaseService.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    try {
      // Create the user
      const user = await this.databaseService.user.create({
        data: {
          username,
          email: normalizedEmail,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      };
      const token = this.jwtService.sign(payload);

      return {
        message: 'User created successfully',
        access_token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('User creation error:', error);
      throw new ConflictException('Failed to create user');
    }
  }

  // Login user
  async login(email: string, password: string) {

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await this.databaseService.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        createdAt: true,
        role: true,
        },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role
    };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  // Validate user for JWT strategy (for protected routes later)
  async validateUser(userId: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        // Don't select password
      },
    });
    return user;
  }
}
