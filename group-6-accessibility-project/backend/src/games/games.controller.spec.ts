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
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    verify: jest.Mock;
    revokeVerification: jest.Mock;
    createView: jest.Mock;
    findGameWithPublisher: jest.Mock;
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
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      verify: jest.fn(),
      revokeVerification: jest.fn(),
      createView: jest.fn(),
      findGameWithPublisher: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
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

  describe('getGameDetails', () => {
    it('should throw if service throws', async () => {
      mockGamesService.findById.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.getGameDetails({ id: 1 } as any)).rejects.toThrow('Failed to retrieve game details');
    });
    it('should handle missing id param', async () => {
      await expect(controller.getGameDetails({} as any)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid'),
        status: HttpStatus.BAD_REQUEST,
      });
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

  describe('create', () => {
    it('should call gamesService.create and return result', async () => {
      const dto = { title: 'T', developer: 'D', genre: [], rating: 5, releaseDate: '', images: [], publisherId: 1, accessibilityTagIds: [], description: '' };
      const expected = { id: 1, ...dto };
      mockGamesService.create = jest.fn().mockResolvedValue(expected);
      const res = await controller.create(dto as any);
      expect(res).toBe(expected);
      expect(mockGamesService.create).toHaveBeenCalledWith(dto);
    });
    it('should throw error if service throws', async () => {
      mockGamesService.create = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(controller.create({} as any)).rejects.toThrow('fail');
    });
  });

  describe('getAllGamesWithPagination', () => {
    it('should call findAll with page/limit', async () => {
      mockGamesService.findAll = jest.fn().mockResolvedValue(['game']);
      const res = await controller.getAllGamesWithPagination({ page: 1, limit: 2 } as any);
      expect(res).toEqual(['game']);
      expect(mockGamesService.findAll).toHaveBeenCalledWith(1, 2);
    });
    it('should wrap non-HTTP errors', async () => {
      mockGamesService.findAll = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(controller.getAllGamesWithPagination({ page: 1, limit: 2 } as any)).rejects.toMatchObject({
        message: 'Failed to retrieve games',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('createView', () => {
    it('should call gamesService.createView', async () => {
      mockGamesService.createView = jest.fn().mockResolvedValue('ok');
      const res = await controller.createView(1, { userId: 2 } as any);
      expect(res).toBe('ok');
      expect(mockGamesService.createView).toHaveBeenCalledWith(1, { userId: 2 });
    });
    it('should throw BAD_REQUEST if id is missing', () => {
      expect(() => controller.createView(undefined as any, { userId: 2 } as any)).toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should call gamesService.findAll', async () => {
      mockGamesService.findAll = jest.fn().mockResolvedValue(['g']);
      const res = await controller.findAll();
      expect(res).toEqual(['g']);
    });
  });

  describe('findOne', () => {
    it('should call gamesService.findOne with numeric id', async () => {
      mockGamesService.findOne = jest.fn().mockResolvedValue('g');
      const res = await controller.findOne('5');
      expect(res).toBe('g');
      expect(mockGamesService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should call update for ADMIN', async () => {
      mockGamesService.update = jest.fn().mockResolvedValue('ok');
      const req = { user: { userId: 1, role: 'ADMIN' } };
      const res = await controller.update('1', { foo: 'bar' }, req);
      expect(res).toBe('ok');
      expect(mockGamesService.update).toHaveBeenCalledWith(1, { foo: 'bar' });
    });
    it('should check ownership for PUBLISHER', async () => {
      mockGamesService.update = jest.fn().mockResolvedValue('ok');
      controller['checkGameOwnership'] = jest.fn().mockResolvedValue(true);
      const req = { user: { userId: 2, role: 'PUBLISHER' } };
      await controller.update('2', { foo: 'bar' }, req);
      expect(controller['checkGameOwnership']).toHaveBeenCalledWith(2, 2);
    });
    it('should throw if service throws', async () => {
      mockGamesService.update = jest.fn().mockRejectedValue(new Error('fail'));
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.update('1', {}, req)).rejects.toThrow('fail');
    });
    it('should throw FORBIDDEN if ownership check fails for publisher', async () => {
      controller['checkGameOwnership'] = jest.fn().mockRejectedValue({
        message: 'Forbidden',
        status: HttpStatus.FORBIDDEN,
      });
      const req = { user: { userId: 2, role: 'PUBLISHER' } };
      await expect(controller.update('2', { foo: 'bar' }, req)).rejects.toMatchObject({
        message: 'Forbidden',
        status: HttpStatus.FORBIDDEN,
      });
    });
    it('should throw BAD_REQUEST if id is missing', async () => {
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.update(undefined as any, {}, req)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid'),
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('remove', () => {
    it('should call remove for ADMIN', async () => {
      mockGamesService.remove = jest.fn().mockResolvedValue('ok');
      const req = { user: { userId: 1, role: 'ADMIN' } };
      const res = await controller.remove('1', req);
      expect(res).toBe('ok');
      expect(mockGamesService.remove).toHaveBeenCalledWith(1);
    });
    it('should check ownership for PUBLISHER', async () => {
      mockGamesService.remove = jest.fn().mockResolvedValue('ok');
      controller['checkGameOwnership'] = jest.fn().mockResolvedValue(true);
      const req = { user: { userId: 2, role: 'PUBLISHER' } };
      await controller.remove('2', req);
      expect(controller['checkGameOwnership']).toHaveBeenCalledWith(2, 2);
    });
    it('should throw if service throws', async () => {
      mockGamesService.remove = jest.fn().mockRejectedValue(new Error('fail'));
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.remove('1', req)).rejects.toThrow('fail');
    });
    it('should throw FORBIDDEN if ownership check fails for publisher', async () => {
      controller['checkGameOwnership'] = jest.fn().mockRejectedValue({
        message: 'Forbidden',
        status: HttpStatus.FORBIDDEN,
      });
      const req = { user: { userId: 2, role: 'PUBLISHER' } };
      await expect(controller.remove('2', req)).rejects.toMatchObject({
        message: 'Forbidden',
        status: HttpStatus.FORBIDDEN,
      });
    });
    it('should throw BAD_REQUEST if id is missing', async () => {
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.remove(undefined as any, req)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid'),
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('verify', () => {
    it('should call gamesService.verify', async () => {
      mockGamesService.verify = jest.fn().mockResolvedValue('ok');
      const req = { user: { userId: 1, role: 'ADMIN' } };
      const res = await controller.verify('1', req);
      expect(res).toBe('ok');
      expect(mockGamesService.verify).toHaveBeenCalledWith(1);
    });
    it('should throw if service throws', async () => {
      mockGamesService.verify = jest.fn().mockRejectedValue(new Error('fail'));
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.verify('1', req)).rejects.toThrow('fail');
    });
    it('should throw BAD_REQUEST if id is missing', async () => {
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.verify(undefined as any, req)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid'),
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('revokeVerification', () => {
    it('should call gamesService.revokeVerification', async () => {
      mockGamesService.revokeVerification = jest.fn().mockResolvedValue('ok');
      const req = { user: { userId: 1, role: 'ADMIN' } };
      const res = await controller.revokeVerification('1', req);
      expect(res).toBe('ok');
      expect(mockGamesService.revokeVerification).toHaveBeenCalledWith(1);
    });
    it('should throw if service throws', async () => {
      mockGamesService.revokeVerification = jest.fn().mockRejectedValue(new Error('fail'));
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.revokeVerification('1', req)).rejects.toThrow('fail');
    });
    it('should throw BAD_REQUEST if id is missing', async () => {
      const req = { user: { userId: 1, role: 'ADMIN' } };
      await expect(controller.revokeVerification(undefined as any, req)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid'),
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('checkGameOwnership', () => {
    it('should throw NOT_FOUND if no game', async () => {
      mockGamesService.findGameWithPublisher = jest.fn().mockResolvedValue(null);
      await expect(controller['checkGameOwnership'](1, 1)).rejects.toMatchObject({
        message: 'Game not found',
        status: HttpStatus.NOT_FOUND,
      });
    });
    it('should throw FORBIDDEN if no publisher', async () => {
      mockGamesService.findGameWithPublisher = jest.fn().mockResolvedValue({ Publisher: null });
      await expect(controller['checkGameOwnership'](1, 1)).rejects.toMatchObject({
        message: 'Game has no associated publisher',
        status: HttpStatus.FORBIDDEN,
      });
    });
    it('should throw FORBIDDEN if publisher userId mismatch', async () => {
      mockGamesService.findGameWithPublisher = jest.fn().mockResolvedValue({ Publisher: { userId: 2 } });
      await expect(controller['checkGameOwnership'](1, 1)).rejects.toMatchObject({
        message: expect.stringContaining('Forbidden'),
        status: HttpStatus.FORBIDDEN,
      });
    });
    it('should throw 500 if service throws', async () => {
      mockGamesService.findGameWithPublisher = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(controller['checkGameOwnership'](1, 1)).rejects.toMatchObject({
        message: 'Failed to verify game ownership',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
    it('should resolve if ownership is valid', async () => {
      mockGamesService.findGameWithPublisher = jest.fn().mockResolvedValue({ Publisher: { userId: 1 } });
      await expect(controller['checkGameOwnership'](1, 1)).resolves.toBeUndefined();
    });
  });
});