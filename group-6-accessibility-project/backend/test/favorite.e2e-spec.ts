/**
 * E2E tests for FavoritesController using a mocked FavoritesService.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { FavoritesController } from '../src/favorites/favorites.controller';
import { FavoritesService } from '../src/favorites/favorites.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('FavoritesController (e2e)', () => {
  let app: INestApplication;

  // Mock service responses
  const mockFavoritesService = {
    getFavorites: jest.fn().mockResolvedValue([
      { userId: 1, gameId: 10 },
      { userId: 1, gameId: 20 },
    ]),
    toggleFavorite: jest.fn().mockResolvedValue({
      added: true,
      userId: 1,
      gameId: 10,
    }),
  };

  // Create app with controller + mocked service
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockFavoritesService }],
    })
      .overrideGuard(ThrottlerGuard) // Disable rate-limit during tests
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // GET /favorites/:userId
  it('returns user favorites', async () => {
    return request(app.getHttpServer())
      .get('/favorites/1')
      .expect(200)
      .expect([
        { userId: 1, gameId: 10 },
        { userId: 1, gameId: 20 },
      ]);
  });

  // POST /favorites/toggle
  it('toggles a favorite', async () => {
    return request(app.getHttpServer())
      .post('/favorites/toggle')
      .send({ userId: 1, gameId: 10 })
      .expect(201)
      .expect({
        added: true,
        userId: 1,
        gameId: 10,
      });
  });
});
