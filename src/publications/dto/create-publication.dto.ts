import { IsDateString, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreatePublicationDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  mediaId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  postId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
