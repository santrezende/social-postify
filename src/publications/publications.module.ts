import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PublicationsRepository } from './publications.repository';
import { MediasModule } from 'src/medias/medias.module';
import { PostsModule } from 'src/posts/posts.module';
import { MediasRepository } from 'src/medias/medias.repository';
import { PostsRepository } from 'src/posts/posts.repository';

@Module({
  imports: [PrismaModule, MediasModule, PostsModule],
  controllers: [PublicationsController],
  providers: [
    PublicationsService,
    PublicationsRepository,
    MediasRepository,
    PostsRepository,
  ],
})
export class PublicationsModule {}
