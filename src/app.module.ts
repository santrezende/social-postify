import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicationsModule } from './publications/publications.module';
import { MediasModule } from './medias/medias.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [PublicationsModule, MediasModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
