import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediasRepository {
  private prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  findByInput(mediaDto: CreateMediaDto | UpdateMediaDto) {
    return this.prisma.media.findFirst({
      where: {
        title: mediaDto.title,
        username: mediaDto.username,
      },
    });
  }

  create(createMediaDto: CreateMediaDto) {
    return this.prisma.media.create({ data: createMediaDto });
  }

  findAll() {
    return this.prisma.media.findMany();
  }

  findById(id: number) {
    return this.prisma.media.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return this.prisma.media.update({
      where: {
        id,
      },
      data: {
        title: updateMediaDto.title,
        username: updateMediaDto.username,
      },
    });
  }

  delete(id: number) {
    return this.prisma.media.delete({
      where: {
        id,
      },
    });
  }

  findIdInPublications(id: number) {
    return this.prisma.media.findFirst({
      where: { id },
      include: {
        Publication: true,
      },
    });
  }
}
