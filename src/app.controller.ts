import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Devuelve un mensaje de Hello World' })
  @ApiResponse({
    status: 200,
    description: 'El mensaje fue devuelto exitosamente.',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
