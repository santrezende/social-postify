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

  findAllPublished(published: boolean) {
    const today = new Date;
    const filter = published ? { lt: today } : { gt: today };
    return this.prisma.publication.findMany({
      where: {
        date: filter
      }
    })
  }

  findAllAfter(after: Date) {
    return this.prisma.publication.findMany({
      where: {
        date: {
          gt: after
        }
      }
    })
  }

  filter(published: boolean, after: Date) {
    const today = new Date();

    if (published) {
      if (after > today) return [];
      return this.prisma.publication.findMany({ // from date to today
        where: {
          AND: [
            { date: { gt: after } },
            { date: { lt: today } }
          ]
        }
      })
    }

    const refDate = after > today ? after : today;
    return this.prisma.publication.findMany({
      where: {
        date: {
          gt: refDate
        }
      }
    })
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
