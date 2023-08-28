import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createMedia } from '../factories/medias-factory';
import { createPostWithImage } from '../factories/posts-factory';
import { cleanDb } from 'test/clean-db';
import { createPublication } from 'test/factories/publications-factory';

describe('Publications', () => {
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

  const baseRoute = '/publications';

  describe('POST /', () => {
    it('should respond with status code 400 if body is invalid', async () => {
      const { statusCode } = await server.post(baseRoute).send({});
      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if mediaId dosent exist', async () => {
      const post = await createPostWithImage(prisma);
      const { statusCode } = await server
        .post(baseRoute)
        .send({ mediaId: 1, postId: post.id, date: new Date() });
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
    it('should respond with status code 404 if postId dosent exist', async () => {
      const media = await createMedia(prisma);
      const { statusCode } = await server
        .post(baseRoute)
        .send({ mediaId: media.id, postId: 1, date: new Date() });
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
    it('should create a new publication in db', async () => {
      const media = await createMedia(prisma);
      const post = await createPostWithImage(prisma);
      const { statusCode } = await server
        .post(baseRoute)
        .send({ mediaId: media.id, postId: post.id, date: new Date() });
      expect(statusCode).toBe(HttpStatus.CREATED);

      const publication = await prisma.publication.findFirst();
      expect(publication).not.toBe(null);
    });
  });

  describe('GET /', () => {});

  describe('GET /:id', () => {
    it('should respond with status code 400 if id is invalid', async () => {
      const { statusCode } = await server.get(`${baseRoute}/invalidId`);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if id dosent exist', async () => {
      const { statusCode } = await server.get(`${baseRoute}/1`);

      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with publication of specific id', async () => {
      const publication = await createPublication(prisma);
      const { statusCode, body } = await server.get(
        `${baseRoute}/${publication.id}`,
      );

      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual({
        ...publication,
        date: publication.date.toISOString(),
      });
    });
  });

  describe('PUT /:id', () => {});

  describe('DELETE /:id', () => {
    it('should respond with status code 400 if id is invalid', async () => {
      const { statusCode } = await server.delete(`${baseRoute}/invalidId`);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if id dosent exist', async () => {
      const { statusCode } = await server.delete(`${baseRoute}/1`);

      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should delete the publication in db', async () => {
      const publication = await createPublication(prisma);
      const { statusCode } = await server.delete(
        `${baseRoute}/${publication.id}`,
      );

      expect(statusCode).toBe(HttpStatus.OK);

      const isDeleted = await prisma.publication.findUnique({
        where: { id: publication.id },
      });
      expect(isDeleted).toBe(null);
    });
  });
});
