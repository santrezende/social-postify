import {
  ConflictException,
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
  create(createMediaDto: CreateMediaDto) {
    const existingMedia = this.mediasRepository.findByInput(createMediaDto);

    if (existingMedia) throw new ConflictException();

    return this.mediasRepository.create(createMediaDto);
  }

  findAll() {
    return this.mediasRepository.findAll();
  }

  findOne(id: number) {
    const idMedia = this.mediasRepository.findById(id);
    if (!idMedia) throw new NotFoundException();

    return idMedia;
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    const existingMedia = this.mediasRepository.findByInput(updateMediaDto);
    if (existingMedia) throw new ConflictException();

    const updateMedia = this.mediasRepository.findById(id);
    if (!updateMedia) throw new NotFoundException();

    return this.mediasRepository.update(id, updateMediaDto);
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
