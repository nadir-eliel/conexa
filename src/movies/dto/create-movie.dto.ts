import {
  IsString,
  IsInt,
  IsArray,
  IsNumber,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Inception',
    description: 'El título de la película',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 2010,
    description: 'El año de lanzamiento de la película',
  })
  @IsInt()
  year: number;

  @ApiProperty({
    example: 'Christopher Nolan',
    description: 'El director de la película',
  })
  @IsString()
  director: string;

  @ApiProperty({
    example: ['Sci-Fi', 'Action'],
    description: 'Géneros de la película',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({ example: 8.8, description: 'Calificación de la película' })
  @IsNumber()
  score: number;
}
