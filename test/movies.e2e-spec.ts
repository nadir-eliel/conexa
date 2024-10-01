/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from '../src/auth/guards/role.enum';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let regularUserJwt: string;
  let adminUserJwt: string;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  beforeEach(async () => {
    await usersRepository.query('DELETE FROM users');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const regularUser = await usersRepository.save({
      username: 'regularUser',
      password: hashedPassword,
      email: 'regular@example.com',
      userTypeId: Role.Regular,
    });

    const adminUser = await usersRepository.save({
      username: 'adminUser',
      password: hashedPassword,
      email: 'admin@example.com',
      userTypeId: Role.Administrador,
    });

    const regularLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'regularUser', password: 'password123' })
      .expect(200);

    regularUserJwt = regularLoginResponse.body.access_token;

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'adminUser', password: 'password123' })
      .expect(200);

    adminUserJwt = adminLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movies (POST) - éxito con usuario administrador', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.6,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual('Star Wars');
  });

  it('/movies (POST) - falla con usuario regular', async () => {
    await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .send({
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.6,
      })
      .expect(403);
  });

  it('/movies (GET) - éxito con usuario administrador', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(0);
  });

  it('/movies (GET) - éxito con usuario regular', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(0);
  });

  it('/movies/:id (GET) - éxito con usuario regular', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    const response = await request(app.getHttpServer())
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', movieId);
    expect(response.body.title).toEqual('The Matrix');
  });

  it('/movies/:id (GET) - falla con usuario administrador', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    await request(app.getHttpServer())
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .expect(403);
  });

  it('/movies/:id (PATCH) - éxito con usuario administrador', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix Reloaded',
        year: 2003,
        score: 7.2,
      })
      .expect(200);

    expect(response.body).toHaveProperty('id', movieId);
    expect(response.body.title).toEqual('The Matrix Reloaded');
    expect(response.body.year).toEqual(2003);
    expect(response.body.score).toEqual(7.2);
  });

  it('/movies/:id (PATCH) - falla con usuario regular', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    await request(app.getHttpServer())
      .patch(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .send({
        title: 'The Matrix Reloaded',
      })
      .expect(403);
  });

  it('/movies/:id (DELETE) - éxito con usuario administrador', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    await request(app.getHttpServer())
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .expect(404);
  });

  it('/movies/:id (DELETE) - falla con usuario regular', async () => {
    const newMovie = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .send({
        title: 'The Matrix',
        year: 1999,
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        score: 8.7,
      })
      .expect(201);

    const movieId = newMovie.body.id;

    await request(app.getHttpServer())
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .expect(403);
  });

  it('/movies/sync-starwars (POST) - éxito con usuario administrador', async () => {
    const mockStarWarsApiResponse: AxiosResponse = {
      data: {
        results: [
          {
            title: 'A New Hope',
            release_date: '1977-05-25',
            director: 'George Lucas',
          },
          {
            title: 'The Empire Strikes Back',
            release_date: '1980-05-17',
            director: 'Irvin Kershner',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockStarWarsApiResponse));

    const response = await request(app.getHttpServer())
      .post('/movies/sync-starwars')
      .set('Authorization', `Bearer ${adminUserJwt}`)
      .expect(201);

    expect(response.body).toEqual({
      message: 'Películas sincronizadas exitosamente',
    });
  });

  it('/movies/sync-starwars (POST) - falla con usuario regular', async () => {
    await request(app.getHttpServer())
      .post('/movies/sync-starwars')
      .set('Authorization', `Bearer ${regularUserJwt}`)
      .expect(403);
  });
});
