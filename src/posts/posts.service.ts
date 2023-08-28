import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  private readonly postsRepository: PostsRepository;

  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
  }
  create(createPostDto: CreatePostDto) {
    return this.postsRepository.create(createPostDto);
  }

  findAll() {
    return this.postsRepository.findAll();
  }

  async findOne(id: number) {
    const idPost = await this.postsRepository.findById(id);
    if (!idPost) throw new NotFoundException();

    return idPost;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const updatePost = await this.postsRepository.findById(id);
    if (!updatePost) throw new NotFoundException();
    return this.postsRepository.update(id, updatePostDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.postsRepository.findIdInPublications(id);
    if (result.Publication.length !== 0) {
      throw new ForbiddenException();
    }
    return this.postsRepository.delete(id);
  }
}
