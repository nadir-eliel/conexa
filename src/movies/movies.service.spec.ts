import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepository: Repository<Movie>;
  let httpService: HttpService;

  const mockMoviesRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMoviesRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería devolver una lista de películas', async () => {
      const movies: Movie[] = [
        {
          id: 1,
          title: 'Star Wars',
          year: 1977,
          director: 'George Lucas',
          genres: ['Sci-Fi'],
          score: 8.6,
        },
      ];

      mockMoviesRepository.find.mockResolvedValue(movies);

      const result = await service.findAll();
      expect(result).toEqual(movies);
      expect(moviesRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver una película por su ID', async () => {
      const movie: Movie = {
        id: 1,
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi'],
        score: 8.6,
      };

      mockMoviesRepository.findOneBy.mockResolvedValue(movie);

      const result = await service.findOne(1);
      expect(result).toEqual(movie);
      expect(moviesRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('debería lanzar un error si la película no es encontrada', async () => {
      mockMoviesRepository.findOneBy.mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(moviesRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('create', () => {
    it('debería crear una nueva película', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.6,
      };

      const movie: Movie = {
        id: 1,
        ...createMovieDto,
      };

      mockMoviesRepository.create.mockReturnValue(movie);
      mockMoviesRepository.save.mockResolvedValue(movie);

      const result = await service.create(createMovieDto);
      expect(result).toEqual(movie);
      expect(moviesRepository.create).toHaveBeenCalledWith(createMovieDto);
      expect(moviesRepository.save).toHaveBeenCalledWith(movie);
    });
  });

  describe('update', () => {
    it('debería actualizar una película existente', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Star Wars: A New Hope',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 9.0,
      };

      const updatedMovie: Movie = {
        id: 1,
        ...updateMovieDto,
      } as Movie;

      mockMoviesRepository.preload.mockResolvedValue(updatedMovie);
      mockMoviesRepository.save.mockResolvedValue(updatedMovie);

      const result = await service.update(1, updateMovieDto);
      expect(result).toEqual(updatedMovie);
      expect(moviesRepository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateMovieDto,
      });
      expect(moviesRepository.save).toHaveBeenCalledWith(updatedMovie);
    });

    it('debería lanzar un error si la película no es encontrada', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Star Wars: A New Hope',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 9.0,
      };

      mockMoviesRepository.preload.mockResolvedValue(undefined);

      await expect(service.update(1, updateMovieDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(moviesRepository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateMovieDto,
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar una película existente', async () => {
      const movie: Movie = {
        id: 1,
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.6,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(movie);
      mockMoviesRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(moviesRepository.remove).toHaveBeenCalledWith(movie);
    });

    it('debería lanzar un error si la película no es encontrada', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('syncMoviesFromStarWarsAPI', () => {
    it('debería sincronizar películas desde la API de Star Wars', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              title: 'A New Hope',
              release_date: '1977-05-25',
              director: 'George Lucas',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      mockMoviesRepository.findOne.mockResolvedValue(undefined);
      mockMoviesRepository.create.mockReturnValue({
        title: 'A New Hope',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.5,
      });

      const result = await service.syncMoviesFromStarWarsAPI();
      expect(result).toEqual({
        message: 'Películas sincronizadas exitosamente',
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `${process.env.STAR_WARS_API}/films`,
      );
      expect(moviesRepository.create).toHaveBeenCalled();
      expect(moviesRepository.save).toHaveBeenCalled();
    });
  });
});
