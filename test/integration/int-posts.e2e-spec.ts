import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import { Post } from '@prisma/client';
import { cleanDb } from 'test/clean-db';
import {
  createPostWithImage,
  createPostWithoutImage,
} from 'test/factories/posts-factory';
import { createPublication } from 'test/factories/publications-factory';

describe('Posts', () => {
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

  const baseRoute = '/posts';

  describe('POST /', () => {
    it('should respond with status code 400 if body is invalid', async () => {
      const invalidBody = { title: 'title', text: '' };
      const { statusCode } = await server.post(baseRoute).send(invalidBody);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should create a new post in db', async () => {
      const { statusCode } = await server
        .post(baseRoute)
        .send({ title: 'title', text: faker.internet.url() });

      expect(statusCode).toBe(HttpStatus.CREATED);
      const postCreated = await prisma.post.findFirst();
      expect(postCreated).not.toBe(null);
    });
  });

  describe('GET /', () => {
    it('should respond with empty array if no posts registered', async () => {
      const { statusCode, body } = await server.get(baseRoute);
      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual([]);
    });

    it('should respond with all posts in correct format', async () => {
      await createPostWithImage(prisma);
      await createPostWithoutImage(prisma);
      const { statusCode, body } = await server.get(baseRoute);
      expect(statusCode).toBe(HttpStatus.OK);

      body.forEach((post: Post) => {
        expect(post.id).toEqual(expect.any(Number));
        expect(post.title).toEqual(expect.any(String));
        expect(post.text).toEqual(expect.any(String));
        if (post.image) {
          expect(post.image).toEqual(expect.any(String));
        }
      });
    });
  });

  describe('GET /:id', () => {
    it('should respond with status code 404 if dosenst exist', async () => {
      const { statusCode } = await server.get(`${baseRoute}/1`);
      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with post of specific id in correct format with image', async () => {
      const post = await createPostWithImage(prisma);
      const { statusCode, body } = await server.get(`${baseRoute}/${post.id}`);
      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toEqual(post);
    });

    it('should respond with post of specific id in correct format without image', async () => {
      const post = await createPostWithoutImage(prisma);
      const { statusCode, body } = await server.get(`${baseRoute}/${post.id}`);
      expect(statusCode).toBe(HttpStatus.OK);
      delete post.image;
      expect(body).toEqual(post);
    });
  });

  describe('PUT /:id', () => {
    it('should respond with status code 400 if body is invalid', async () => {
      const { statusCode } = await server
        .put(`${baseRoute}/1`)
        .send({ text: 'not an url' });

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should respond with status code 404 if id dosent exist', async () => {
      const { statusCode } = await server
        .put(`${baseRoute}/1`)
        .send({ title: 'title', text: faker.internet.url() });

      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should update post data in db', async () => {
      const post = await createPostWithImage(prisma);
      const newTitle = faker.lorem.text();
      const { statusCode } = await server
        .put(`${baseRoute}/${post.id}`)
        .send({ title: newTitle });

      expect(statusCode).toBe(HttpStatus.OK);

      const postChanged = await prisma.post.findUnique({
        where: { id: post.id },
      });

      expect(postChanged.title).toBe(newTitle);
    });
  });

  describe('DELETE /:id', () => {
    it('should respond with status code 404 if id dosent exist', async () => {
      const { statusCode } = await server.delete(`${baseRoute}/1`);

      expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should respond with status code 403 and not delete the post if its in a publication', async () => {
      const publication = await createPublication(prisma);
      const { statusCode } = await server.delete(
        `${baseRoute}/${publication.postId}`,
      );

      expect(statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('should delete the post in db', async () => {
      const post = await createPostWithImage(prisma);
      const { statusCode } = await server.delete(`${baseRoute}/${post.id}`);

      expect(statusCode).toBe(HttpStatus.OK);

      const isDeleted = await prisma.post.findUnique({
        where: { id: post.id },
      });

      expect(isDeleted).toBe(null);
    });
  });
});
