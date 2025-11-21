import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  beforeEach(async () => {
    const mockGamesService = {
      findById: jest.fn((id: number) => ({
        id,
        title: 'Mock Game',
        developer: 'Mock Dev',
        rating: 4.5,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        { provide: GamesService, useValue: mockGamesService },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 1 game', async () => {
    const game = await controller.getGameDetails({ id: 1 });

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(game).toEqual({
      id: 1,
      title: 'Mock Game',
      developer: 'Mock Dev',
      rating: 4.5,
    });
  });
});
