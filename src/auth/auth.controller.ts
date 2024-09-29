import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './login-user.dto';
import { ValidationPipe } from '@nestjs/common'; // Importamos ValidationPipe para aplicar validación
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Autenticación de usuario' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'El usuario fue autenticado exitosamente. Devuelve un JWT.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @HttpCode(200)
  @Post('login')
  async login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.authService.validateUser(username, password);
    return this.authService.login(user);
  }
}
