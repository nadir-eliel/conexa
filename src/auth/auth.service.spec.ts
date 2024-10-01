import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(bcrypt, 'compare').mockImplementation((pass) => {
      return pass === 'valid_password';
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('debería devolver el usuario sin la contraseña si las credenciales son válidas', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashed_password',
        email: 'test@example.com',
        userTypeId: 1,
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'testuser',
        'valid_password',
      );

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        userTypeId: 1,
      });

      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('debería lanzar un UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(
        authService.validateUser('testuser', 'any_password'),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));

      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('debería lanzar un UnauthorizedException si la contraseña es incorrecta', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        password: 'hashed_password',
        email: 'test@example.com',
        userTypeId: 1,
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        authService.validateUser('testuser', 'invalid_password'),
      ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));

      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
    });
  });

  describe('login', () => {
    it('debería devolver un JWT si el usuario está autenticado', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
      };

      const mockJwtToken = 'mock_jwt_token';

      mockJwtService.sign.mockReturnValue(mockJwtToken);

      const result = await authService.login(mockUser);

      expect(result).toEqual({
        access_token: mockJwtToken,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
    });
  });
});
