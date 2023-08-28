import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsRepository {
  private prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  create(createPublicationDto: CreatePublicationDto) {
    return this.prisma.publication.create({ data: createPublicationDto });
  }

  findAll() {
    return this.prisma.publication.findMany();
  }

  findById(id: number) {
    return this.prisma.publication.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: number, updatePublicationDto: UpdatePublicationDto) {
    return this.prisma.publication.update({
      where: {
        id,
      },
      data: {
        mediaId: updatePublicationDto.mediaId,
        postId: updatePublicationDto.postId,
        date: updatePublicationDto.date,
      },
    });
  }

  remove(id: number) {
    return this.prisma.publication.delete({
      where: {
        id,
      },
    });
  }
}
