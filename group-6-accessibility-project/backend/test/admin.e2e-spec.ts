import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';

jest.setTimeout(30000);

describe('AdminController (e2e) - comprehensive', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const adminUser = {
    id: 2,
    username: 'Tim',
    email: 'testing@test.com',
    role: 'admin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror app-level validation pipe
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  const makeToken = (payload: Record<string, unknown>, opts?: Record<string, unknown>) =>
    jwtService.sign(payload, (opts as any) ?? {});

  it('GET /admin - success with valid admin token', async () => {
    const token = makeToken({
      sub: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    const res = await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(HttpStatus.OK);
    // controller currently returns no payload; accept empty body / undefined / {}
    // use deep equality for object checks
    const body = res.body === '' ? '' : res.body;
    if (body && typeof body === 'object') {
        // deep equality for object responses
        expect(body).toEqual({});
    } else {
        // allow undefined, null or empty-string responses
        expect([undefined, null, '']).toContain(body);
    }
  });

  it('GET /admin - unauthorized (no Authorization header)', async () => {
    await request(app.getHttpServer()).get('/admin').expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /admin - unauthorized (malformed token)', async () => {
    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', 'Bearer this.is.not.a.valid.token')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /admin - unauthorized (missing Bearer prefix)', async () => {
    const token = makeToken({
      sub: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    // some auth implementations reject missing Bearer scheme
    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', token) // no "Bearer "
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /admin - forbidden for non-admin role', async () => {
    const token = makeToken({
      sub: 3,
      username: 'NotAdmin',
      email: 'not@admin.com',
      role: 'user',
    });

    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('GET /admin - forbidden when token lacks role claim', async () => {
    const token = makeToken({
      sub: 4,
      username: 'NoRoleUser',
      email: 'norole@test.com',
      // no role
    });

    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('GET /admin - unauthorized for tampered token (signature invalid)', async () => {
    const goodToken = makeToken({
      sub: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    // tamper the token by changing one character
    const tampered = goodToken.slice(0, -1) + (goodToken.slice(-1) === 'a' ? 'b' : 'a');

    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${tampered}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /admin - expired token returns 401', async () => {
    const expired = makeToken(
      {
        sub: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
      { expiresIn: -10 }, // already expired
    );

    await request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${expired}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /admin - responds consistently under rapid repeated calls (basic stability check)', async () => {
    const token = makeToken({
      sub: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    // fire several sequential requests to ensure no intermittent auth/state issues
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .get('/admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(HttpStatus.OK);
    }
  });
});