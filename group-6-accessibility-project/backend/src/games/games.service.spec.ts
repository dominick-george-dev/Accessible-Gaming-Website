import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { DatabaseService } from '../database/database.service';

describe('GamesService', () => {
  let service: GamesService;
  let dbMock: any;
  let time = new Date();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService, {
        provide: DatabaseService,
        useValue: {
          game: {
              findUnique: jest.fn().mockResolvedValue({ id: 1, title: 'Zelda', description: 'A game', images: ['url', 'url2'], genre: ['Adventure'], createdAt: time, updatedAt: time }),
              findMany: jest.fn(),
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
  });

  it('should return 1 game', async () => {
    const game = await service.findById(1);
    expect(game).toEqual({ id: 1, title: 'Zelda', description: 'A game', images: ['url', 'url2'], genre: ['Adventure'], createdAt: time, updatedAt: time });
  });

  it('throws on invalid (non-numeric) id', async () => {
    await expect(service.findSimilarGames('not-a-number')).rejects.toThrow('Invalid game ID');
  });

  it('throws when base game not found', async () => {
    dbMock.game.findUnique.mockResolvedValueOnce(null);
    await expect(service.findSimilarGames(2)).rejects.toThrow('Game with ID 2 not found');
  });

  it('returns empty array when there are no other games', async () => {
    const base = {
      id: 1,
      genre: ['Adventure'],
      gameAccessibilityTags: [],
      rating: 5,
    };
    dbMock.game.findUnique.mockResolvedValueOnce(base);
    // findAllGames uses game.findMany -> return empty array to simulate no other games
    dbMock.game.findMany.mockResolvedValueOnce([]);
    const res = await service.findSimilarGames(1);
    expect(res).toEqual([]);
  });

  it('scores games and resolves accessibility tags (happy path)', async () => {
    const base = {
      id: 1,
      genre: ['Adventure'],
      // base tag objects (name present so name-based match works)
      gameAccessibilityTags: [{ id: 10, name: 'subtitles' }],
      rating: 7,
    };
    const game2 = {
      id: 2,
      genre: ['Adventure'],
      rating: 9,
      // link row contains accessibilityTagsId and name so both name-match and id-collection work
      gameAccessibilityTags: [{ accessibilityTagsId: 10, name: 'subtitles' }],
    };
    const game3 = {
      id: 3,
      genre: ['Puzzle'],
      rating: 8,
      gameAccessibilityTags: [{ accessibilityTagsId: 11, name: 'hints' }],
    };

    dbMock.game.findUnique.mockResolvedValueOnce(base);
    dbMock.game.findMany.mockResolvedValueOnce([base, game2, game3]);
    dbMock.accessibilityTags.findMany.mockResolvedValueOnce([
      { id: 10, name: 'subtitles' },
      { id: 11, name: 'hints' },
    ]);

    const res = await service.findSimilarGames(1, { limit: 2 });
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
      // base has simple tag strings (or non-id objects) so no tag ids will be collected from scored games
      gameAccessibilityTags: [{ tag: 'subtitles' }],
      rating: 7,
    };
    const game2 = {
      id: 2,
      genre: ['Adventure'],
      rating: 9,
      // explicitly empty link list
      gameAccessibilityTags: [],
    };
    const game3 = {
      id: 3,
      genre: ['Adventure'],
      rating: 8,
      // missing gameAccessibilityTags entirely
    };

    dbMock.game.findUnique.mockResolvedValueOnce(base);
    dbMock.game.findMany.mockResolvedValueOnce([base, game2, game3]);
    // accessibilityTags.findMany should not be needed for this branch; if called, return empty
    dbMock.accessibilityTags.findMany.mockResolvedValueOnce([]);

    const res = await service.findSimilarGames('1', { limit: 5 });
    // Two other games expected (ids 2 and 3), each should include empty accessibilityTags arrays
    expect(res.length).toBe(2);
    expect(res.map((g: any) => g.id).sort()).toEqual([2, 3]);
    for (const g of res) {
      expect(g.accessibilityTags).toEqual([]);
    }
  });
});
