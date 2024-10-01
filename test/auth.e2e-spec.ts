import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.save({
      username: 'user12345',
      password: await bcrypt.hash('password123', 10),
      email: 'user12345@example.com',
      userTypeId: 1,
    });
  });

  afterEach(async () => {
    await userRepository.delete({ username: 'user12345' });
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
      .send({ username: 'user12345', password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toEqual('Credenciales inválidas');
  });
});
