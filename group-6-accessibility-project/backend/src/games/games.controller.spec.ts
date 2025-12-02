import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;
  let mockGamesService: {
    findById: jest.Mock;
    findSimilarGames: jest.Mock;
    getAccessibilityTagsForGame: jest.Mock;
  };

  beforeEach(async () => {
    mockGamesService = {
      findById: jest.fn((id: number) => ({
        id,
        title: 'Mock Game',
        developer: 'Mock Dev',
        rating: 4.5,
        images: ['http://example.com/image.png', 'http://example.com/image2.png'],
        genre: ['Action'],
        releaseDate: '2023-01-01',
      })),
      findSimilarGames: jest.fn(),
      getAccessibilityTagsForGame: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // ✅ Add required modules for guards
        ThrottlerModule.forRoot([{
          ttl: 60,
          limit: 10,
        }]),
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [GamesController],
      providers: [
        { provide: GamesService, useValue: mockGamesService },
        // ✅ Mock the auth guards and dependencies
        {
          provide: 'JwtStrategy',
          useValue: {
            validate: jest.fn().mockResolvedValue({ userId: 1, role: 'ADMIN' }),
          },
        },
        {
          provide: 'RolesGuard',
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        Reflector,
      ],
    })
    // ✅ Override guards for testing
    .overrideGuard('ThrottlerGuard')
    .useValue({
      canActivate: jest.fn().mockReturnValue(true),
    })
    .overrideGuard('JwtAuthGuard')
    .useValue({
      canActivate: jest.fn().mockReturnValue(true),
    })
    .overrideGuard('RolesGuard')
    .useValue({
      canActivate: jest.fn().mockReturnValue(true),
    })
    .compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return game details and call service with numeric id', async () => {
    const result = await controller.getGameDetails({ id: 1 } as any);
    expect(mockGamesService.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      title: 'Mock Game',
      developer: 'Mock Dev',
      rating: 4.5,
      genre: ['Action'],
      images: [
        'http://example.com/image.png',
        'http://example.com/image2.png',
      ],
      releaseDate: '2023-01-01',
    });
  });

  describe('getSimilarGames', () => {
    it('returns results from service (success) and passes string id', async () => {
      const expected = [{ id: 2, title: 'A' }];
      mockGamesService.findSimilarGames.mockResolvedValue(expected);

      const res = await controller.getSimilarGames({ id: 1 } as any);
      expect(res).toEqual({ data: expected });
      expect(mockGamesService.findSimilarGames).toHaveBeenCalledWith('1', { limit: 8 });
    });

    it('re-throws HttpException from service', async () => {
      const httpErr = new HttpException('bad', HttpStatus.BAD_REQUEST);
      mockGamesService.findSimilarGames.mockRejectedValue(httpErr);

      await expect(controller.getSimilarGames({ id: 5 } as any)).rejects.toBe(httpErr);
    });

    it('wraps non-HTTP errors with generic 500 HttpException', async () => {
      mockGamesService.findSimilarGames.mockRejectedValue(new Error('db down'));

      await expect(controller.getSimilarGames({ id: 10 } as any)).rejects.toMatchObject({
        message: 'Failed to retrieve similar games',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('accepts string id param and passes it through as string', async () => {
      const expected = [{ id: 7 }];
      mockGamesService.findSimilarGames.mockResolvedValue(expected);

      const res = await controller.getSimilarGames({ id: '42' } as any);
      expect(res).toEqual({ data: expected });
      expect(mockGamesService.findSimilarGames).toHaveBeenCalledWith('42', { limit: 8 });
    });
  });

  describe('getAccessibilityTagsForGame', () => {
    it('returns tags from service (success) and passes numeric id', async () => {
      const tags = [{ id: 11, name: 'subtitles' }];
      mockGamesService.getAccessibilityTagsForGame.mockResolvedValue(tags);

      const res = await controller.getAccessibilityTagsForGame('2');
      expect(res).toBe(tags);
      expect(mockGamesService.getAccessibilityTagsForGame).toHaveBeenCalledWith(2);
    });

    it('re-throws HttpException from service', async () => {
      const httpErr = new HttpException('no perms', HttpStatus.FORBIDDEN);
      mockGamesService.getAccessibilityTagsForGame.mockRejectedValue(httpErr);

      await expect(controller.getAccessibilityTagsForGame('3')).rejects.toBe(httpErr);
    });

    it('wraps non-HTTP errors with generic 500 HttpException', async () => {
      mockGamesService.getAccessibilityTagsForGame.mockRejectedValue(new Error('boom'));

      await expect(controller.getAccessibilityTagsForGame('99')).rejects.toMatchObject({
        message: 'Failed to retrieve accessibility tags',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('forwards NaN when non-numeric id string provided', async () => {
      const tags: any[] = [];
      mockGamesService.getAccessibilityTagsForGame.mockResolvedValue(tags);

      const res = await controller.getAccessibilityTagsForGame('not-a-number');
      expect(res).toBe(tags);
      expect(mockGamesService.getAccessibilityTagsForGame).toHaveBeenCalledWith(Number('not-a-number'));
    });
  });
});