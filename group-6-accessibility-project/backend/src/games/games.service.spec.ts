import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { DatabaseService } from '../database/database.service';

describe('GamesService', () => {
  let service: GamesService;
  let time = new Date();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService, {
        provide: DatabaseService,
        useValue: {
          game: {
              findUnique: jest.fn().mockResolvedValue({ id: 1, title: 'Zelda', description: 'A game', thumbnail: 'url', genre: ['Adventure'], createdAt: time, updatedAt: time }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should return 1 game', async () => {
    const game = await service.findById(1);
    expect(game).toEqual({ id: 1, title: 'Zelda', description: 'A game', thumbnail: 'url', genre: ['Adventure'], createdAt: time, updatedAt: time });
  });
});
