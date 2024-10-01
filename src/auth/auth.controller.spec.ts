import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './login-user.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debería autenticar al usuario y devolver un JWT', async () => {
      const loginUserDto: LoginUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = { id: '1', username: 'testuser' };
      const mockJwt = { access_token: 'jwt_token' };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockJwt);

      const result = await controller.login(loginUserDto);
      expect(result).toEqual(mockJwt);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.username,
        loginUserDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('debería lanzar un error si las credenciales son incorrectas', async () => {
      const loginUserDto: LoginUserDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      try {
        await controller.login(loginUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);

        expect(error.response).toEqual({
          message: 'Credenciales inválidas',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.username,
        loginUserDto.password,
      );
    });
  });
});
