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
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    db = app.get(DatabaseService);
    // Clean up before test to avoid unique constraint errors
    // Delete reviews first, then games, then users, to avoid FK constraint errors
    try {
      await db.review.deleteMany({});
    } catch (e) {}
    try {
      await db.game.deleteMany({});
    } catch (e) {}
    try {
      await db.user.deleteMany({});
    } catch (e) {}
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
    // Delete reviews first, then games, then users, to avoid FK constraint errors
    try {
      await db.review.deleteMany({});
    } catch (e) {}
    try {
      await db.game.deleteMany({});
    } catch (e) {}
    try {
      await db.user.deleteMany({});
    } catch (e) {}
    await app.close();
  });

  beforeEach(async () => {
    // Extra safety: delete all reviews before each test
    try {
      await db.review.deleteMany({});
    } catch (e) {}
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
    // Optionally check relations if present
    // expect(res.body.User?.id).toBe(1);
    // expect(res.body.game?.id).toBe(1);
    createdReviewId = res.body.id;
  });

  it('/reviews (GET) returns all reviews', async () => {
    const res = await request(app.getHttpServer())
      .get('/reviews')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    // Optionally check a review's fields
    expect(res.body[0]).toHaveProperty('rating');
    expect(res.body[0]).toHaveProperty('comment');
  });

  it('/reviews/game/:gameId (GET) returns reviews for a game', async () => {
    const res = await request(app.getHttpServer())
      .get('/reviews/game/1')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Optionally check for game relation if present
    // expect(res.body[0].game?.id || res.body[0].gameId).toBe(1);
  });

  it('/reviews/:id (GET) returns a single review', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reviews/${createdReviewId}`)
      .expect(200);
    expect(res.body.id).toBe(createdReviewId);
    expect(res.body).toHaveProperty('rating');
    expect(res.body).toHaveProperty('comment');
  });

  it('/reviews/:id (PATCH) updates a review', async () => {
    const updateDto = { comment: 'Updated comment', rating: 4 };
    const res = await request(app.getHttpServer())
      .patch(`/reviews/${createdReviewId}`)
      .send(updateDto)
      .expect(200);
    expect(res.body.comment).toBe('Updated comment');
    expect(res.body.rating).toBe(4);
  });

  it('/reviews/:id (DELETE) deletes a review', async () => {
    await request(app.getHttpServer())
      .delete(`/reviews/${createdReviewId}`)
      .expect(200);
    // Confirm deletion
    await request(app.getHttpServer())
      .get(`/reviews/${createdReviewId}`)
      .expect(200)
      .then(res => expect(res.body).toEqual({}));
  });
});
