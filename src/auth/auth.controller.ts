import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './login-user.dto';
import { ValidationPipe } from '@nestjs/common'; // Importamos ValidationPipe para aplicar validación

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.authService.validateUser(username, password);
    return this.authService.login(user);
  }
}
