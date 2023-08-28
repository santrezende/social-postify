import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { createMedia } from '../factories/medias-factory';
import { createPublication } from '../factories/publications-factory';
import { cleanDb } from '../clean-db';

describe('Medias', () => {
  let app: INestApplication;
  let server: request.SuperTest<request.Test>;
  const prisma: PrismaService = new PrismaService();
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await cleanDb(prisma);

    server = request(app.getHttpServer());
    await app.init();
  });

  const baseRoute = '/medias';

  describe('POST /', () => {
    it('should respond with status code 400 if body is invalid', async () => {
      return server
        .post(baseRoute)
        .send({ title: 1, username: 'myusername' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should responde with status code 409 if the combination title and username already exist in db', async () => {
      const media = await createMedia(prisma);
      const { statusCode } = await server
        .post(baseRoute)
        .send({ title: media.title, username: media.username });
      expect(statusCode).toBe(HttpStatus.CONFLICT);

      const mediasCount = await prisma.media.count();
      expect(mediasCount).toBe(1);
    });

    it('should create a new post in database and respond with status code 201', async () => {
      const { statusCode } = await server.post(baseRoute).send({
        title: 'Instagram',
        username: 'usernamTest',
      });
      expect(statusCode).toBe(HttpStatus.CREATED);
      const media = await prisma.media.findFirst();
      expect(media).not.toBe(null);
    });
  });

  describe('GET /', () => {
    it('should respond with am empty array if no medias registered', async () => {
      const { statusCode, body } = await server.get(baseRoute);
      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual([]);
    });

    it('should return all medias in correct format', async () => {
      await createMedia(prisma);
      await createMedia(prisma);
      const { statusCode, body } = await server.get(baseRoute);
      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            username: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('GET /:id', () => {
    it('should respond with status code 400 if id is invalid', async () => {
      const { statusCode } = await server.get(`${baseRoute}/invalidId`);
      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if id doest exist', async () => {
      const { statusCode } = await server.get(`${baseRoute}/9`);
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with media data of correspondent id', async () => {
      const media = await createMedia(prisma);
      const { statusCode, body } = await server.get(`${baseRoute}/${media.id}`);
      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual(media);
    });
  });

  describe('PUT /:id', () => {
    it('should respond with status code 400 if id is invalid', async () => {
      const { statusCode } = await server.put(`${baseRoute}/invalidId`);
      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 400 if body is invalid', async () => {
      const media = await createMedia(prisma);

      const { statusCode } = await server
        .put(`${baseRoute}/${media.id}`)
        .send({ title: 1, username: 'myusername' });
      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if id doest exist', async () => {
      const { statusCode } = await server
        .put(`${baseRoute}/9`)
        .send({ title: 'title', username: 'username' });
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with status code 409 if the change combination title and username already exist in db ', async () => {
      const firstMedia = await createMedia(prisma);
      const secondMedia = await createMedia(prisma);
      const { statusCode } = await server
        .put(`${baseRoute}/${secondMedia.id}`)
        .send({ title: firstMedia.title, username: firstMedia.username });
      expect(statusCode).toBe(HttpStatus.CONFLICT);

      const verifyNotChange = await prisma.media.findFirst({
        where: {
          id: secondMedia.id,
        },
      });
      expect(verifyNotChange).toEqual(secondMedia);
    });

    it('should change the media in db', async () => {
      const media = await createMedia(prisma);
      const newUsername = faker.person.fullName();
      const { statusCode } = await server
        .put(`${baseRoute}/${media.id}`)
        .send({ title: media.title, username: newUsername });

      expect(statusCode).toBe(HttpStatus.OK);

      const { username } = await prisma.media.findFirst({
        where: {
          id: media.id,
        },
      });
      expect(username).toBe(newUsername);
    });
  });

  describe('DELETE /:id', () => {
    it('should respond with status code 400 if id is invalid', async () => {
      const { statusCode } = await server.delete(`${baseRoute}/invalidId`);
      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
    it('should respond with status code 404 if id doest exist', async () => {
      const { statusCode } = await server.delete(`${baseRoute}/9`);
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
    it('should respond with status code 403 and not delete the media if its in a publication', async () => {
      const publication = await createPublication(prisma);
      const { statusCode } = await server.delete(
        `${baseRoute}/${publication.mediaId}`,
      );
      expect(statusCode).toBe(HttpStatus.FORBIDDEN);

      const verifyNotDelete = await prisma.media.findFirst();
      expect(verifyNotDelete).not.toBe(null);
    });
    it('should delete media from db', async () => {
      const media = await createMedia(prisma);
      await server.delete(`${baseRoute}/${media.id}`);
      const isDeleted = await prisma.media.findUnique({
        where: { id: media.id },
      });
      expect(isDeleted).toBe(null);
    });
  });
});
