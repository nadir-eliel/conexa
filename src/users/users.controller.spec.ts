import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un usuario', async () => {
      const createUserDto: CreateUserDto = {
        username: 'john_doe',
        password: 'password123',
        email: 'john.doe@example.com',
        userTypeId: 1,
      };

      const result: User = {
        id: 'e37c6edd-b3c9-4c05-ae43-5c1e975271df',
        username: 'john_doe',
        password: 'hashed_password',
        email: 'john.doe@example.com',
        userTypeId: 1,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockUsersService.create.mockResolvedValue(result);

      const response = await controller.create(createUserDto);
      expect(response).toEqual(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        createUserDto.username,
        createUserDto.password,
        createUserDto.email,
        createUserDto.userTypeId,
      );
    });
  });

  describe('findAll', () => {
    it('debería devolver una lista de usuarios', async () => {
      const users: User[] = [
        {
          id: 'e37c6edd-b3c9-4c05-ae43-5c1e975271df',
          username: 'user1',
          password: 'hashed_password',
          email: 'user1@example.com',
          userTypeId: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'e37c6edd-b3c9-4c05-ae43-5c1e975271dg',
          username: 'user2',
          password: 'hashed_password',
          email: 'user2@example.com',
          userTypeId: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as User[];

      mockUsersService.findAll.mockResolvedValue(users);

      const response = await controller.findAll();
      expect(response).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería devolver un usuario por ID', async () => {
      const user: User = {
        id: 'e37c6edd-b3c9-4c05-ae43-5c1e975271df',
        username: 'john_doe',
        password: 'hashed_password',
        email: 'john.doe@example.com',
        userTypeId: 1,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockUsersService.findOne.mockResolvedValue(user);

      const response = await controller.findOne('1');
      expect(response).toEqual(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });

    it('debería devolver undefined si el usuario no es encontrado', async () => {
      mockUsersService.findOne.mockResolvedValue(undefined);

      const response = await controller.findOne('non_existing_id');
      expect(response).toBeUndefined();
      expect(mockUsersService.findOne).toHaveBeenCalledWith('non_existing_id');
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario por ID', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(mockUsersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
