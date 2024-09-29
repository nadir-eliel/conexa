import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly httpService: HttpService,
  ) {}

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find();
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOneBy({ id });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    // TODO: revisar que la pelicula no exista previamente
    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.moviesRepository.preload({
      id,
      ...updateMovieDto,
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return this.moviesRepository.save(movie);
  }

  async remove(id: number): Promise<void> {
    const movie = await this.findOne(id);
    await this.moviesRepository.remove(movie);
  }

  async syncMoviesFromStarWarsAPI(): Promise<any> {
    const starWarsApiUrl = process.env.STAR_WARS_API + '/films';

    const response$ = this.httpService.get(starWarsApiUrl);
    const response = await lastValueFrom(response$);

    const films = response.data.results;

    for (const film of films) {
      const createMovieDto: CreateMovieDto = {
        title: film.title,
        year: new Date(film.release_date).getFullYear(),
        director: film.director,
        genres: ['Sci-Fi', 'Adventure'], //TODO: averiguar los generos
        score: 8.5, //TODO: creo que esto no se va a usar
      };

      const existingMovie = await this.moviesRepository.findOne({
        where: { title: film.title },
      });
      if (!existingMovie) {
        const movie = this.moviesRepository.create(createMovieDto);
        await this.moviesRepository.save(movie);
      }
    }

    return { message: 'Películas sincronizadas exitosamente' };
  }
}
