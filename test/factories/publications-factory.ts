import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createMedia } from './medias-factory';
import { createPostWithImage } from './posts-factory';

export async function createPublication(prisma: PrismaService) {
  const media = await createMedia(prisma);
  const post = await createPostWithImage(prisma);

  return prisma.publication.create({
    data: {
      date: faker.date.future({ years: 1 }),
      mediaId: media.id,
      postId: post.id,
    },
  });
}
