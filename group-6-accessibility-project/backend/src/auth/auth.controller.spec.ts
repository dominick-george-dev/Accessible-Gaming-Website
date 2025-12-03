import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let jwtService: JwtService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthService injected', () => {
    expect(service).toBeDefined();
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'PUBLISHER'
      };

      const mockRequest = {
        user: { userId: 1 }
      };

      // Mock the database call
      databaseService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.refreshToken(mockRequest);

      expect(result).toEqual({
        access_token: 'mocked-token',
        user: mockUser
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
        role: 'PUBLISHER'
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockRequest = { user: { userId: 999 } };
      
      databaseService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(controller.refreshToken(mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });
});