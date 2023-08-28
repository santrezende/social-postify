import { Injectable, NotFoundException } from '@nestjs/common';
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
  create(createPublicationDto: CreatePublicationDto) {
    const validateMedia = this.mediasRepository.findById(
      createPublicationDto.mediaId,
    );
    const validatePost = this.postsRepository.findById(
      createPublicationDto.postId,
    );

    if (!validateMedia || !validatePost) throw new NotFoundException();

    return this.publicationsRepository.create(createPublicationDto);
  }

  findAll() {
    return this.publicationsRepository.findAll();
  }

  findOne(id: number) {
    const idPublication = this.publicationsRepository.findById(id);
    if (!idPublication) throw new NotFoundException();

    return idPublication;
  }

  update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const validateMedia = this.mediasRepository.findById(
      updatePublicationDto.mediaId,
    );
    const validatePost = this.postsRepository.findById(
      updatePublicationDto.postId,
    );
    const validatePublication = this.publicationsRepository.findById(id);

    if (!validateMedia || !validatePost || !validatePublication)
      throw new NotFoundException();
  }

  remove(id: number) {
    const idPublication = this.publicationsRepository.findById(id);
    if (!idPublication) throw new NotFoundException();

    return this.publicationsRepository.remove(id);
  }
}
