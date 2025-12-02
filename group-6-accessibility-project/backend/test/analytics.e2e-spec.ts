import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;

  // Mock user data for JWT
  const mockUser = {
    id: 2,
    username: 'Tim',
    email: 'testing@test.com',
    role: 'PUBLISHER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get(JwtService);

    // Sign a JWT with the correct payload
    accessToken = jwtService.sign({
      sub: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/analytics/publisher (GET) - success', async () => {
    const res = await request(app.getHttpServer())
      .get('/analytics/publisher')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // You can add more specific checks depending on your analytics response shape
    expect(res.body).toBeDefined();
    // Example: expect(res.body).toHaveProperty('topViewedGames');
  });

  it('/analytics/publisher (GET) - unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/analytics/publisher')
      .expect(401); // No token provided
  });

  it('/analytics/publisher (GET) - forbidden for wrong role', async () => {
    // Sign a JWT with a role that is not allowed
    const badToken = jwtService.sign({
      sub: 3,
      username: 'NotPublisher',
      email: 'not@pub.com',
      role: 'USER',
    });


    await request(app.getHttpServer())
      .get('/analytics/publisher')
      .set('Authorization', `Bearer ${badToken}`)
      .expect(403);
  });

  it('/analytics/publisher (GET) - invalid token', async () => {
    await request(app.getHttpServer())
      .get('/analytics/publisher')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });

  it('/analytics/publisher (GET) - expired token', async () => {
    // Create a token that is already expired
    const expiredToken = jwtService.sign(
      {
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      },
      { expiresIn: -10 } // expired 10 seconds ago
    );

    await request(app.getHttpServer())
      .get('/analytics/publisher')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('/analytics/publisher (GET) - check response structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/analytics/publisher')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Example: check for expected keys (customize as needed)
    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('games');
    expect(res.body).toHaveProperty('topViewedGames');
    expect(res.body).toHaveProperty('topRatedGames');
    expect(res.body).toHaveProperty('accessibilityFeatureDistribution');
    expect(res.body).toHaveProperty('avgTotalRating');
    expect(res.body).toHaveProperty('totalGames');
  });
});