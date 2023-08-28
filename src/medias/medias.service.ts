import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  private readonly mediasRepository: MediasRepository;

  constructor(mediasRepository: MediasRepository) {
    this.mediasRepository = mediasRepository;
  }
  async create(createMediaDto: CreateMediaDto) {
    const existingMedia =
      await this.mediasRepository.findByInput(createMediaDto);

    if (existingMedia) throw new ConflictException();

    return this.mediasRepository.create(createMediaDto);
  }

  findAll() {
    return this.mediasRepository.findAll();
  }

  async findOne(id: number) {
    const idMedia = await this.mediasRepository.findById(id);
    if (!idMedia) throw new NotFoundException();

    return idMedia;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    const existingMedia =
      await this.mediasRepository.findByInput(updateMediaDto);
    if (existingMedia) throw new ConflictException();

    const updateMedia = await this.mediasRepository.findById(id);
    if (!updateMedia) throw new NotFoundException();

    return this.mediasRepository.update(id, updateMediaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.mediasRepository.findIdInPublications(id);

    if (result.Publication.length !== 0) throw new ForbiddenException();
    return this.mediasRepository.delete(id);
  }
}
