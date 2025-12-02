import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';

describe('GamesController (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseService;
  let createdGameId: number;
  let publisherId: number;
  let accessibilityTagId: number;
  let viewId: number;
  let time = new Date();

  const createGameDto = {
    title: 'Test Game',
    description: 'A test game',
    developer: 'Test Dev',
    genre: ['Action'],
    rating: 5,
    releaseDate: time.toISOString(),
    images: [],
    publisherId: 1,
    accessibilityTagIds: [] as number[], // Explicitly type as number[]
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    db = app.get(DatabaseService);
    // Clean up
    try { await db.view.deleteMany({}); } catch (e) {}
    try { await db.review.deleteMany({}); } catch (e) {}
    try { await db.gameAccessibilityTags.deleteMany({}); } catch (e) {}
    try { await db.game.deleteMany({}); } catch (e) {}
    try { await db.accessibilityTags.deleteMany({}); } catch (e) {}
    try { await db.publisher.deleteMany({}); } catch (e) {}
    try { await db.user.deleteMany({}); } catch (e) {}
    // Create required user and publisher
    const user = await db.user.upsert({
      where: { email: 'publisher@example.com' },
      update: { username: 'publisher', password: 'pw', role: 'PUBLISHER' },
      create: { email: 'publisher@example.com', username: 'publisher', password: 'pw', role: 'PUBLISHER' },
    });
    const publisher = await db.publisher.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    publisherId = publisher.id;
    // Create accessibility tag (use correct field names: tag, category)
    const tag = await db.accessibilityTags.create({ data: { tag: 'Colorblind Friendly', category: 'General' } });
    accessibilityTagId = tag.id;
    createGameDto.accessibilityTagIds = [accessibilityTagId];
  });

  afterAll(async () => {
    try { await db.view.deleteMany({}); } catch (e) {}
    try { await db.review.deleteMany({}); } catch (e) {}
    try { await db.gameAccessibilityTags.deleteMany({}); } catch (e) {}
    try { await db.game.deleteMany({}); } catch (e) {}
    try { await db.accessibilityTags.deleteMany({}); } catch (e) {}
    try { await db.publisher.deleteMany({}); } catch (e) {}
    try { await db.user.deleteMany({}); } catch (e) {}
    await app.close();
  });

  it('/games (POST) creates a game', async () => {
    // Simulate publisher role
    const res = await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', 'Bearer publisher-token') // Replace with valid token if needed
      .send(createGameDto)
      .expect(201);
    expect(res.body.title).toBe('Test Game');
    expect(res.body.description).toBe('A test game');
    createdGameId = res.body.id;
  });

  it('/games/gameDetails/:id (GET) returns game details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/games/gameDetails/${createdGameId}`)
      .expect(200);
    expect(res.body.id).toBe(createdGameId);
    expect(res.body.title).toBe('Test Game');
  });

  it('/games/getall (GET) returns all games with pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/games/getall?page=1&limit=10')
      .expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination.page).toBe(1);
  });

  it('/games/view/:id (POST) creates a view', async () => {
    const viewDto = { viewedAt: new Date().toISOString() };
    const res = await request(app.getHttpServer())
      .post(`/games/view/${createdGameId}`)
      .send(viewDto)
      .expect(201);
    expect(res.body.gameId).toBe(createdGameId);
    viewId = res.body.id;
  });

  it('/games/similar/:id (GET) returns similar games', async () => {
    const res = await request(app.getHttpServer())
      .get(`/games/similar/${createdGameId}`)
      .expect(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/games/:id/accessibility-tags (GET) returns accessibility tags for a game', async () => {
    const res = await request(app.getHttpServer())
      .get(`/games/${createdGameId}/accessibility-tags`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].tag).toBe('Colorblind Friendly');
  });

  it('/games (GET) returns all games', async () => {
    const res = await request(app.getHttpServer())
      .get('/games')
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('/games/:id (GET) returns a single game', async () => {
    const res = await request(app.getHttpServer())
      .get(`/games/${createdGameId}`)
      .expect(200);
    expect(res.body.id).toBe(createdGameId);
    expect(res.body.title).toBe('Test Game');
  });

  it('/games/:id (PUT) updates a game', async () => {
    const updateDto = { title: 'Updated Game', description: 'Updated desc', genre: ['Puzzle'] };
    const res = await request(app.getHttpServer())
      .put(`/games/${createdGameId}`)
      .set('Authorization', 'Bearer publisher-token') // Replace with valid token if needed
      .send(updateDto)
      .expect(200);
    expect(res.body.title).toBe('Updated Game');
    expect(res.body.description).toBe('Updated desc');
  });

  it('/games/:id (DELETE) deletes a game', async () => {
    await request(app.getHttpServer())
      .delete(`/games/${createdGameId}`)
      .set('Authorization', 'Bearer publisher-token') // Replace with valid token if needed
      .expect(200);
    // Confirm deletion
    await request(app.getHttpServer())
      .get(`/games/${createdGameId}`)
      .expect(200)
      .then(res => expect(res.body).toEqual({}));
  });

  it('/games/:id/verify (PATCH) verifies a game', async () => {
    // Re-create game for verification
    const resCreate = await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', 'Bearer publisher-token')
      .send(createGameDto)
      .expect(201);
    const gameId = resCreate.body.id;
    // Simulate admin role
    const res = await request(app.getHttpServer())
      .patch(`/games/${gameId}/verify`)
      .set('Authorization', 'Bearer admin-token') // Replace with valid token if needed
      .expect(200);
    expect(res.body.hasBeenVerified).toBe(true);
  });

  it('/games/:id/revoke-verification (PATCH) revokes verification', async () => {
    // Re-create game for verification and revocation
    const resCreate = await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', 'Bearer publisher-token')
      .send(createGameDto)
      .expect(201);
    const gameId = resCreate.body.id;
    // Simulate admin role to verify
    await request(app.getHttpServer())
      .patch(`/games/${gameId}/verify`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200);
    // Now revoke verification
    const res = await request(app.getHttpServer())
      .patch(`/games/${gameId}/revoke-verification`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200);
    expect(res.body.hasBeenVerified).toBe(false);
  });
});