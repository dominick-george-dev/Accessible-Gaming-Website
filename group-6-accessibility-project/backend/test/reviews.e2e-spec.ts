import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseService;
  let createdReviewId: number;
  let time = new Date();

  // In-memory mock DB state
  const reviews: any[] = [];
  const users: any[] = [{ id: 1, email: 'testuser@example.com', username: 'testuser', password: 'pw', role: 'USER' }];
  const games: any[] = [{ id: 1, title: 'Test Game', developer: 'dev', genre: ['Action'], rating: 5, releaseDate: time, images: [], description: 'desc', publisherId: null }];

  // Mocked DatabaseService
  const dbMock = {
    review: {
      create: jest.fn(async ({ data }) => {
        const newReview = { ...data, id: reviews.length + 1 };
        reviews.push(newReview);
        return newReview;
      }),
      findMany: jest.fn(async (args?: any) => {
        if (!args || !args.where) return [...reviews];
        if (args.where.gameId) return reviews.filter(r => r.game?.connect?.id === args.where.gameId || r.gameId === args.where.gameId);
        return [...reviews];
      }),
      findUnique: jest.fn(async ({ where }) => {
        return reviews.find(r => r.id === where.id) || {};
      }),
      update: jest.fn(async ({ where, data }) => {
        const idx = reviews.findIndex(r => r.id === where.id);
        if (idx === -1) return {};
        reviews[idx] = { ...reviews[idx], ...data };
        return reviews[idx];
      }),
      delete: jest.fn(async ({ where }) => {
        const idx = reviews.findIndex(r => r.id === where.id);
        if (idx === -1) return {};
        const deleted = reviews.splice(idx, 1)[0];
        return deleted || {};
      }),
      deleteMany: jest.fn(async () => {
        reviews.length = 0;
        return { count: 0 };
      }),
    },
    user: {
      upsert: jest.fn(async ({ where, update, create }) => {
        let user = users.find(u => u.id === where.id);
        if (user) {
          Object.assign(user, update);
          return user;
        } else {
          users.push(create);
          return create;
        }
      }),
      deleteMany: jest.fn(async () => {
        users.length = 0;
        return { count: 0 };
      }),
    },
    game: {
      upsert: jest.fn(async ({ where, update, create }) => {
        let game = games.find(g => g.id === where.id);
        if (game) {
          Object.assign(game, update);
          return game;
        } else {
          games.push(create);
          return create;
        }
      }),
      deleteMany: jest.fn(async () => {
        games.length = 0;
        return { count: 0 };
      }),
    },
  };

  const reviewDto = {
    rating: 5,
    comment: 'Great game!',
    accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
    userName: 'testuser',
    User: { connect: { id: 1 } },
    game: { connect: { id: 1 } },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(dbMock)
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    db = app.get(DatabaseService);
    // Clean up before test to avoid unique constraint errors
    await db.review.deleteMany();
    await db.game.deleteMany();
    await db.user.deleteMany();
    // Ensure a user exists for foreign key (use upsert to avoid unique constraint error)
    await db.user.upsert({
      where: { id: 1 },
      update: { email: 'testuser@example.com', username: 'testuser', password: 'pw', role: 'USER' },
      create: { id: 1, email: 'testuser@example.com', username: 'testuser', password: 'pw', role: 'USER' },
    });
    // Ensure a game exists for foreign key (use upsert to avoid unique constraint error)
    await db.game.upsert({
      where: { id: 1 },
      update: { title: 'Test Game', developer: 'dev', genre: ['Action'], rating: 5, releaseDate: time, images: [], description: 'desc', publisherId: null },
      create: { id: 1, title: 'Test Game', developer: 'dev', genre: ['Action'], rating: 5, releaseDate: time, images: [], description: 'desc', publisherId: null },
    });
  });

  afterAll(async () => {
    await db.review.deleteMany();
    await db.game.deleteMany();
    await db.user.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await db.review.deleteMany();
  });

  it('/reviews (POST) creates a review', async () => {
    const res = await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto)
      .expect(201);
    expect(res.body).toMatchObject({
      rating: 5,
      comment: 'Great game!',
      accessibilityFeedback: ['Easy to Read', 'Colorblind Friendly'],
    });
    createdReviewId = res.body.id;
  });

  it('/reviews (GET) returns all reviews', async () => {
    // Create a review first
    await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto);
    const res = await request(app.getHttpServer())
      .get('/reviews')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('rating');
    expect(res.body[0]).toHaveProperty('comment');
  });

  it('/reviews/game/:gameId (GET) returns reviews for a game', async () => {
    // Create a review first
    await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto);
    const res = await request(app.getHttpServer())
      .get('/reviews/game/1')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/reviews/:id (GET) returns a single review', async () => {
    // Create a review first
    const postRes = await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto);
    const id = postRes.body.id;
    const res = await request(app.getHttpServer())
      .get(`/reviews/${id}`)
      .expect(200);
    expect(res.body.id).toBe(id);
    expect(res.body).toHaveProperty('rating');
    expect(res.body).toHaveProperty('comment');
  });

  it('/reviews/:id (PATCH) updates a review', async () => {
    // Create a review first
    const postRes = await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto);
    const id = postRes.body.id;
    const updateDto = { comment: 'Updated comment', rating: 4 };
    const res = await request(app.getHttpServer())
      .patch(`/reviews/${id}`)
      .send(updateDto)
      .expect(200);
    expect(res.body.comment).toBe('Updated comment');
    expect(res.body.rating).toBe(4);
  });

  it('/reviews/:id (DELETE) deletes a review', async () => {
    // Create a review first
    const postRes = await request(app.getHttpServer())
      .post('/reviews')
      .send(reviewDto);
    const id = postRes.body.id;
    await request(app.getHttpServer())
      .delete(`/reviews/${id}`)
      .expect(200);
    // Confirm deletion
    await request(app.getHttpServer())
      .get(`/reviews/${id}`)
      .expect(200)
      .then(res => expect(res.body).toEqual({}));
  });
});
