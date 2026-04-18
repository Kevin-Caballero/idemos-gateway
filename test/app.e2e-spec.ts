import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { AuthModule } from './../src/auth/auth.module';
import { BffModule } from './../src/bff/bff.module';

const TEST_SECRET = 'test-e2e-secret';
const mockTokenPair = { accessToken: 'acc.token', refreshToken: 'ref.token' };
const mockFeed = { data: [], total: 0, page: 1, limit: 20 };

describe('Gateway (e2e)', () => {
  let app: INestApplication<App>;
  let authClient: jest.Mocked<Pick<ClientProxy, 'send'>>;
  let backendClient: jest.Mocked<Pick<ClientProxy, 'send'>>;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_SECRET;

    authClient = { send: jest.fn() };
    backendClient = { send: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, BffModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue(authClient)
      .overrideProvider('BACKEND_SERVICE')
      .useValue(backendClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth endpoints ──────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('returns 201 with token pair on valid body', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'new@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'nope@example.com' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when password is shorter than 8 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 with token pair on valid credentials', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns 200 with new token pair', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'some.refresh.token' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  // ── Feed endpoint ───────────────────────────────────────────────────────────

  describe('GET /feed', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const res = await request(app.getHttpServer()).get('/feed');
      expect(res.status).toBe(401);
    });

    it('returns 401 when an invalid token is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/feed')
        .set('Authorization', 'Bearer totally.invalid.token');

      expect(res.status).toBe(401);
    });

    it('returns 200 with feed data when a valid JWT is provided', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      const token = jwtService.sign(
        { sub: 'uuid-1', email: 'test@example.com' },
        { secret: TEST_SECRET, expiresIn: '1h' },
      );

      const res = await request(app.getHttpServer())
        .get('/feed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
    });

    it('forwards type and page query params to backend', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      const token = jwtService.sign(
        { sub: 'uuid-1', email: 'test@example.com' },
        { secret: TEST_SECRET, expiresIn: '1h' },
      );

      await request(app.getHttpServer())
        .get('/feed?type=Proyecto&page=2&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        expect.objectContaining({ type: 'Proyecto', page: 2, limit: 10 }),
      );
    });
  });
});
