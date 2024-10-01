import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        userTypeId: 1,
      };

      const hashedPassword = 'hashed_password';

      mockUsersRepository.findOne.mockResolvedValue(undefined);
      mockUsersRepository.create.mockReturnValue({
        ...createUserDto,
        password: hashedPassword,
      });
      mockUsersRepository.save.mockResolvedValue({
        id: '1',
        ...createUserDto,
        password: hashedPassword,
      });

      const result = await service.create(
        createUserDto.username,
        createUserDto.password,
        createUserDto.email,
        createUserDto.userTypeId,
      );

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        password: hashedPassword,
        email: 'test@example.com',
        userTypeId: 1,
      });

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });

      expect(usersRepository.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: hashedPassword,
        email: createUserDto.email,
        userTypeId: createUserDto.userTypeId,
      });

      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar un error si el usuario ya existe', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        userTypeId: 1,
      };

      mockUsersRepository.findOne.mockResolvedValue(createUserDto);

      await expect(
        service.create(
          createUserDto.username,
          createUserDto.password,
          createUserDto.email,
          createUserDto.userTypeId,
        ),
      ).rejects.toThrow(ConflictException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      });
    });
  });

  describe('findAll', () => {
    it('debería devolver una lista de usuarios', async () => {
      const users: User[] = [
        {
          id: '1',
          username: 'user1',
          password: 'hashed_password',
          email: 'user1@example.com',
          userTypeId: 1,
          created_at: new Date(),
          updated_at: new Date(),
        } as User,
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería devolver un usuario por su ID', async () => {
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'hashed_password',
        email: 'test@example.com',
        userTypeId: 1,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('debería lanzar un error si el usuario no es encontrado', async () => {
      mockUsersRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario por su ID', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');
      expect(usersRepository.delete).toHaveBeenCalledWith('1');
    });

    it('debería lanzar un error si el usuario no es encontrado al eliminar', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);

      expect(usersRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('findByUsername', () => {
    it('debería devolver un usuario por su nombre de usuario', async () => {
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'hashed_password',
        email: 'test@example.com',
        userTypeId: 1,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('testuser');
      expect(result).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });
  });
});
