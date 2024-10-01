import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './movie.entity';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: MoviesService;

  const mockMoviesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    syncMoviesFromStarWarsAPI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
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
          genres: ['Sci-Fi', 'Adventure'],
          score: 8.6,
        },
      ];

      mockMoviesService.findAll.mockResolvedValue(movies);

      const result = await controller.findAll();
      expect(result).toEqual(movies);
      expect(moviesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver los detalles de una película específica', async () => {
      const movie: Movie = {
        id: 1,
        title: 'Star Wars',
        year: 1977,
        director: 'George Lucas',
        genres: ['Sci-Fi', 'Adventure'],
        score: 8.6,
      };

      mockMoviesService.findOne.mockResolvedValue(movie);

      const result = await controller.findOne('1');
      expect(result).toEqual(movie);
      expect(moviesService.findOne).toHaveBeenCalledWith(1);
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

      mockMoviesService.create.mockResolvedValue(movie);

      const result = await controller.create(createMovieDto);
      expect(result).toEqual(movie);
      expect(moviesService.create).toHaveBeenCalledWith(createMovieDto);
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

      mockMoviesService.update.mockResolvedValue(updatedMovie);

      const result = await controller.update('1', updateMovieDto);
      expect(result).toEqual(updatedMovie);
      expect(moviesService.update).toHaveBeenCalledWith(1, updateMovieDto);
    });
  });

  describe('remove', () => {
    it('debería eliminar una película', async () => {
      mockMoviesService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(moviesService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('syncMoviesFromStarWarsAPI', () => {
    it('debería sincronizar las películas de Star Wars desde la API', async () => {
      const syncResult = { message: 'Películas sincronizadas exitosamente' };

      mockMoviesService.syncMoviesFromStarWarsAPI.mockResolvedValue(syncResult);

      const result = await controller.syncMoviesFromStarWarsAPI();
      expect(result).toEqual(syncResult);
      expect(moviesService.syncMoviesFromStarWarsAPI).toHaveBeenCalled();
    });
  });
});
