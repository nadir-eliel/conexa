import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { Repository } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await repository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('/users (POST) - éxito', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'usertest1',
          password: 'password123',
          email: 'usertest1@example.com',
          userTypeId: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toEqual('usertest1');
      expect(response.body.email).toEqual('usertest1@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('/users (POST) - error 409 al crear un usuario que ya existe', async () => {
      const responseInserted = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'existinguser',
          password: 'password123',
          email: 'existinguser@example.com',
          userTypeId: 1,
        })
        .expect(201);

      const responseFail = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'existinguser',
          password: 'newpassword123',
          email: 'existinguser@example.com',
          userTypeId: 1,
        })
        .expect(409);

      expect(responseFail.body.message).toBe(
        'El nombre de usuario o el correo ya están en uso',
      );
    });
  });

  describe('/users (GET)', () => {
    it('/users (GET) - éxito', async () => {
      const firstUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'user1',
          password: 'password123',
          email: 'user1@example.com',
          userTypeId: 1,
        })
        .expect(201);

      const secondUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'user2',
          password: 'password123',
          email: 'user2@example.com',
          userTypeId: 1,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);

      const [user1, user2] = response.body;
      expect(user1.username).toEqual('user1');
      expect(user1.email).toEqual('user1@example.com');
      expect(user1).not.toHaveProperty('password');

      expect(user2.username).toEqual('user2');
      expect(user2.email).toEqual('user2@example.com');
      expect(user2).not.toHaveProperty('password');
    });
  });

  describe('/users/:id (GET)', () => {
    it('/users/:id (GET) - éxito', async () => {
      const newUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'usertoget',
          password: 'password123',
          email: 'usertoget@example.com',
          userTypeId: 1,
        })
        .expect(201);

      const userId = newUser.body.id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body.username).toEqual('usertoget');
      expect(response.body.email).toEqual('usertoget@example.com');
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('debería eliminar un usuario', async () => {
      const user = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'user1',
          password: 'password123',
          email: 'user1@example.com',
          userTypeId: 1,
        })
        .expect(201);
      await request(app.getHttpServer())
        .delete(`/users/${user.body.id}`)
        .expect(200);

      const foundUser = await repository.findOneBy({ id: user.body.id });
      expect(foundUser).toBeNull();
    });
  });
});
