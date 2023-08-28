import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';

export async function createPostWithImage(prisma: PrismaService) {
  return prisma.post.create({
    data: {
      title: faker.lorem.sentence(),
      text: faker.lorem.sentences(),
      image: faker.image.url(),
    },
  });
}

export async function createPostWithoutImage(prisma: PrismaService) {
  return prisma.post.create({
    data: {
      title: faker.lorem.sentence(),
      text: faker.internet.url(),
    },
  });
}
