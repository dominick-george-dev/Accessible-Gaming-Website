import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { DatabaseService } from '../database/database.service';

describe('GamesService', () => {
  let service: GamesService;
  let dbMock: any;
  let time = new Date();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: DatabaseService,
          useValue: {
            game: {
              findUnique: jest.fn().mockResolvedValue({
                id: 1,
                title: 'Zelda',
                description: 'A game',
                images: ['url', 'url2'],
                genre: ['Adventure'],
                createdAt: time,
                updatedAt: time,
                accessibilityTags: [],
              }),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            accessibilityTags: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    dbMock = module.get(DatabaseService);
    // Add default mocks for gameAccessibilityTags and view for all tests
    dbMock.gameAccessibilityTags = {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    };
    dbMock.view = {
      create: jest.fn(),
    };
    dbMock.review = {
      deleteMany: jest.fn(),
    };
    dbMock.favourites = {
      deleteMany: jest.fn(),
    };
  });

  it('should return 1 game', async () => {
    const game = await service.findById(1);
    expect(game).toEqual({
      id: 1,
      title: 'Zelda',
      description: 'A game',
      images: ['url', 'url2'],
      genre: ['Adventure'],
      createdAt: time,
      updatedAt: time,
      accessibilityTags: [],
    });
  });

  it('throws on invalid (non-numeric) id', async () => {
    await expect((service as any).findSimilarGames('not-a-number')).rejects.toThrow('Invalid game ID');
  });

  it('throws when base game not found', async () => {
    dbMock.game.findUnique.mockResolvedValueOnce(null);
    await expect((service as any).findSimilarGames(2)).rejects.toThrow('Game with ID 2 not found');
  });

  it('returns empty array when there are no other games', async () => {
    const base = {
      id: 1,
      genre: ['Adventure'],
      gameAccessibilityTags: [],
      rating: 5,
    };
    dbMock.game.findUnique.mockResolvedValueOnce(base);
    // first genre-based query -> empty, fallback recent -> empty
    dbMock.game.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const res = await (service as any).findSimilarGames(1);
    expect(res).toEqual([]);
  });

  it('scores games and resolves accessibility tags (happy path)', async () => {
    const base = {
      id: 1,
      genre: ['Adventure'],
      // base tag objects (name present so name-based match works)
      gameAccessibilityTags: [{ accessibilityTags: { id: 10, name: 'subtitles' } }],
      rating: 7,
    };
    const game2 = {
      id: 2,
      genre: ['Adventure'],
      rating: 9,
      // mock link row as the service expects: nested accessibilityTags object
      gameAccessibilityTags: [{ accessibilityTags: { id: 10, name: 'subtitles' } }],
    };
    const game3 = {
      id: 3,
      genre: ['Puzzle'],
      rating: 8,
      gameAccessibilityTags: [{ accessibilityTags: { id: 11, name: 'hints' } }],
    };

    dbMock.game.findUnique.mockResolvedValueOnce(base);
    // service expects findMany to return only other games (exclude base)
    dbMock.game.findMany.mockResolvedValueOnce([game2, game3]);
    dbMock.accessibilityTags.findMany.mockResolvedValueOnce([
      { id: 10, name: 'subtitles' },
      { id: 11, name: 'hints' },
    ]);

    const res = await (service as any).findSimilarGames(1, { limit: 2 });
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
    // game2 should score higher and come first
    expect(res[0].id).toBe(2);
    // accessibilityTags for game2 resolved to full tag object
    expect(res[0].accessibilityTags).toEqual([{ id: 10, name: 'subtitles' }]);
    // second game resolved tag
    expect(res[1].accessibilityTags).toEqual([{ id: 11, name: 'hints' }]);
  });

  it('returns games with empty accessibilityTags when no tag ids are present', async () => {
    const base = {
      id: 1,
      genre: ['Adventure'],
      gameAccessibilityTags: [{ tag: 'subtitles' }],
      rating: 7,
    };
    const game2 = {
      id: 2,
      genre: ['Adventure'],
      rating: 9,
      gameAccessibilityTags: [],
    };
    const game3 = {
      id: 3,
      genre: ['Adventure'],
      rating: 8,
      gameAccessibilityTags: [],
    };

    dbMock.game.findUnique.mockResolvedValueOnce(base);
    // return only the other games
    dbMock.game.findMany.mockResolvedValueOnce([game2, game3]);
    dbMock.accessibilityTags.findMany.mockResolvedValueOnce([]);

    const res = await (service as any).findSimilarGames('1', { limit: 5 });
    expect(res.length).toBe(2);
    expect(res.map((g: any) => g.id).sort()).toEqual([2, 3]);
    for (const g of res) {
      expect(g.accessibilityTags).toEqual([]);
    }
  });

  describe('findAll', () => {
    it('returns paginated games', async () => {
      dbMock.game.findMany.mockResolvedValueOnce([
        { id: 1, title: 'A', description: '', images: [], trailer: null, transcript: null, genre: [], releaseDate: '', developer: '', rating: 0, hasBeenVerified: false, createdAt: time, updatedAt: time, gameAccessibilityTags: [] },
      ]);
      dbMock.game.count.mockResolvedValueOnce(1);
      const res = await service.findAll(1, 10);
      expect(res.data.length).toBe(1);
      expect(res.pagination.total).toBe(1);
    });
    it('throws on db error', async () => {
      dbMock.game.findMany.mockRejectedValueOnce(new Error('fail'));
      dbMock.game.count = jest.fn(); // Prevents undefined error if count is called
      await expect(service.findAll(1, 10)).rejects.toThrow('Failed to retrieve games');
    });
  });

  describe('create', () => {
    it('creates a game and adds tags', async () => {
      dbMock.game.create.mockResolvedValueOnce({ id: 2 });
      dbMock.gameAccessibilityTags = { createMany: jest.fn().mockResolvedValue({}) };
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 2, gameAccessibilityTags: [] });
      const dto = { title: 'T', description: '', developer: '', genre: [], rating: 0, releaseDate: time, images: [], publisherId: 1, accessibilityTagIds: [1, 2] };
      const res = await service.create(dto);
      expect(dbMock.game.create).toHaveBeenCalled();
      expect(dbMock.gameAccessibilityTags.createMany).toHaveBeenCalled();
      expect(res && res.id).toBe(2);
    });
  });

  describe('findOne', () => {
    it('returns a game', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 3 });
      const res = await service.findOne(3);
      expect(res && res.id).toBe(3);
    });
  });

  describe('update', () => {
    it('updates a game and tags', async () => {
      dbMock.game.update.mockResolvedValueOnce({});
      dbMock.gameAccessibilityTags = {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      };
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 4, gameAccessibilityTags: [] });
      const dto = { title: 'U', accessibilityTagIds: [1] };
      const res = await service.update(4, dto);
      expect(dbMock.game.update).toHaveBeenCalled();
      expect(dbMock.gameAccessibilityTags.deleteMany).toHaveBeenCalled();
      expect(dbMock.gameAccessibilityTags.createMany).toHaveBeenCalled();
      expect(res && res.id).toBe(4);
    });
    it('updates a game with no tags', async () => {
      dbMock.game.update.mockResolvedValueOnce({});
      dbMock.gameAccessibilityTags = { deleteMany: jest.fn().mockResolvedValue({}) };
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 5, gameAccessibilityTags: [] });
      const dto = { title: 'U2' };
      const res = await service.update(5, dto);
      expect(res && res.id).toBe(5);
    });
  });

  describe('remove', () => {
    it('removes a game and related records', async () => {
      dbMock.$transaction = jest.fn(fn => fn({
        view: { deleteMany: jest.fn().mockResolvedValue({}) },
        review: { deleteMany: jest.fn().mockResolvedValue({}) },
        gameAccessibilityTags: { deleteMany: jest.fn().mockResolvedValue({}) },
        favourites: { deleteMany: jest.fn().mockResolvedValue({}) },
        game: { delete: jest.fn().mockResolvedValue({ id: 6 }) },
      }));
      const res = await service.remove(6);
      expect(res && res.id).toBe(6);
    });
    it('throws on db error', async () => {
      dbMock.$transaction = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(service.remove(7)).rejects.toThrow('fail');
    });
  });

  describe('verify', () => {
    it('verifies a game', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 8, title: 'V', hasBeenVerified: false });
      dbMock.game.update.mockResolvedValueOnce({ id: 8, hasBeenVerified: true });
      const res = await service.verify(8);
      expect(res && res.hasBeenVerified).toBe(true);
    });
    it('throws if id is invalid', async () => {
      await expect(service.verify(NaN)).rejects.toThrow('Invalid game ID');
    });
    it('throws if not found', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce(null);
      await expect(service.verify(9)).rejects.toThrow('Game with ID 9 not found');
    });
    it('throws on db error', async () => {
      dbMock.game.findUnique.mockImplementationOnce(() => { throw new Error('fail'); });
      await expect(service.verify(10)).rejects.toThrow('Failed to verify game: fail');
    });
  });

  describe('createView', () => {
    it('creates a view', async () => {
      dbMock.view = { create: jest.fn().mockResolvedValue({ id: 11 }) };
      const res = await service.createView(11, { viewedAt: time });
      expect(res && res.id).toBe(11);
    });
  });

  describe('revokeVerification', () => {
    it('revokes verification', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 12, title: 'R', hasBeenVerified: true });
      dbMock.game.update.mockResolvedValueOnce({ id: 12, hasBeenVerified: false });
      const res = await service.revokeVerification(12);
      expect(res && res.hasBeenVerified).toBe(false);
    });
    it('throws if id is invalid', async () => {
      await expect(service.revokeVerification(NaN)).rejects.toThrow('Invalid game ID');
    });
    it('throws if not found', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce(null);
      await expect(service.revokeVerification(13)).rejects.toThrow('Game with ID 13 not found');
    });
    it('throws on db error', async () => {
      dbMock.game.findUnique.mockImplementationOnce(() => { throw new Error('fail'); });
      await expect(service.revokeVerification(14)).rejects.toThrow('Failed to revoke verification: fail');
    });
  });

  describe('findGameWithPublisher', () => {
    it('returns game with publisher', async () => {
      dbMock.game.findUnique.mockResolvedValueOnce({ id: 15, Publisher: { userId: 1 } });
      const res = await service.findGameWithPublisher(15);
      expect(res && res.Publisher && res.Publisher.userId).toBe(1);
    });
    it('throws on db error', async () => {
      dbMock.game.findUnique.mockImplementationOnce(() => { throw new Error('fail'); });
      await expect(service.findGameWithPublisher(16)).rejects.toThrow('Failed to find game: fail');
    });
  });
});