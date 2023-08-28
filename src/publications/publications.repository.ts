import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

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

  remove(id: number) {
    return this.prisma.publication.delete({
      where: {
        id,
      },
    });
  }
}
