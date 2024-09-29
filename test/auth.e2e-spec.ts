import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - éxito', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user12345', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - credenciales inválidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user1', password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toEqual('Credenciales inválidas');
  });
});
