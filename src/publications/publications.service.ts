import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediasRepository } from 'src/medias/medias.repository';
import { PostsRepository } from 'src/posts/posts.repository';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';

@Injectable()
export class PublicationsService {
  private readonly publicationsRepository: PublicationsRepository;
  private readonly mediasRepository: MediasRepository;
  private readonly postsRepository: PostsRepository;

  constructor(
    publicationRepository: PublicationsRepository,
    mediasRepository: MediasRepository,
    postsRepository: PostsRepository,
  ) {
    this.publicationsRepository = publicationRepository;
    this.mediasRepository = mediasRepository;
    this.postsRepository = postsRepository;
  }
  async create(createPublicationDto: CreatePublicationDto) {
    const validateMedia = await this.mediasRepository.findById(
      createPublicationDto.mediaId,
    );
    const validatePost = await this.postsRepository.findById(
      createPublicationDto.postId,
    );

    if (!validateMedia || !validatePost) throw new NotFoundException();

    return this.publicationsRepository.create(createPublicationDto);
  }

  isPastDate(date: Date) {
    const current = new Date();
    if (date < current) throw new HttpException("Cannot schedule in the past", HttpStatus.FORBIDDEN);
  }

  async isValidPublication(dto: CreatePublicationDto | UpdatePublicationDto) {
    const { mediaId, postId, date } = dto;

    if (mediaId) await this.mediasRepository.findById(mediaId);
    if (postId) await this.postsRepository.findById(postId);
    if (date) this.isPastDate(new Date(date))
  }

  async findAllAfter(after: Date) {
    return await this.publicationsRepository.findAllAfter(after);
  }

  async filter(published: boolean, after: Date) {
    return await this.publicationsRepository.filter(published, after);
  }

  findAll() {
    return this.publicationsRepository.findAll();
  }

  async findOne(id: number) {
    const idPublication = await this.publicationsRepository.findById(id);
    if (!idPublication) throw new NotFoundException();

    return idPublication;
  }

  async isPublished(id: number) {
    const result = await this.publicationsRepository.findById(id);
    if (result.date < new Date()) {
      throw new ForbiddenException();
    }
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const validateMedia = await this.mediasRepository.findById(
      updatePublicationDto.mediaId,
    );
    const validatePost = await this.postsRepository.findById(
      updatePublicationDto.postId,
    );
    const validatePublication = await this.publicationsRepository.findById(id);

    if (!validateMedia || !validatePost || !validatePublication)
      throw new NotFoundException();

    if (validatePublication.date < new Date()) throw new ForbiddenException();

    return this.publicationsRepository.update(id, updatePublicationDto);
  }

  async remove(id: number) {
    const idPublication = await this.publicationsRepository.findById(id);
    if (!idPublication) throw new NotFoundException();

    return this.publicationsRepository.remove(id);
  }
}
