import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOperation({ summary: 'Obtener la lista de todas las películas' }) // Resumen del endpoint
  @ApiResponse({
    status: 200,
    description: 'Lista de películas devuelta exitosamente.',
    type: [Movie],
  })
  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @ApiOperation({ summary: 'Obtener los detalles de una película específica' }) // Resumen del endpoint
  @ApiParam({ name: 'id', description: 'ID de la película' }) // Descripción del parámetro
  @ApiResponse({
    status: 200,
    description: 'Detalles de la película devueltos exitosamente.',
    type: Movie,
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' }) // Película no encontrada
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Crear una nueva película (solo para administradores)',
  })
  @ApiBody({ type: CreateMovieDto })
  @ApiResponse({
    status: 201,
    description: 'Película creada exitosamente.',
    type: Movie,
  })
  // @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @ApiOperation({
    summary:
      'Actualizar la información de una película existente (solo para administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  @ApiBody({ type: UpdateMovieDto })
  @ApiResponse({
    status: 200,
    description: 'Película actualizada exitosamente.',
    type: Movie,
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @ApiOperation({
    summary: 'Eliminar una película (solo para administradores)',
  })
  @ApiParam({ name: 'id', description: 'ID de la película' })
  @ApiResponse({ status: 200, description: 'Película eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Película no encontrada.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }

  @ApiOperation({
    summary: 'Sincroniza las películas de Star Wars con la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Películas sincronizadas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Solo administradores pueden acceder.',
  })
  @Post('sync-starwars')
  async syncMoviesFromStarWarsAPI() {
    return this.moviesService.syncMoviesFromStarWarsAPI();
  }
}
