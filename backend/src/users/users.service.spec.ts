import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: any;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullname: 'Test User',
    roles: [Role.USER],
    isDisabled: false,
    phoneNumber: '555-1234',
    workstationNumber: 'WS-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockResolvedValue(mockUser);

      const result = await service.create({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        fullname: 'New User',
        roles: [Role.USER],
      });

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException for duplicate username or email', async () => {
      // The service uses a single query with OR condition for both username and email
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          username: 'testuser',
          email: 'new@example.com',
          password: 'password123',
          fullname: 'New User',
          roles: [Role.USER],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Same query returns existing user - could be duplicate username OR email
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
          fullname: 'New User',
          roles: [Role.USER],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      usersRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent username', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent email', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findAgents', () => {
    it('should return users with agent or admin roles', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ ...mockUser, roles: [Role.AGENT] }]),
      };
      usersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAgents();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('password', 'hashedPassword');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrong', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser });
      usersRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.update('user-123', { fullname: 'Updated Name' });

      expect(result.fullname).toBe('Updated Name');
    });

    it('should hash password when updating', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      usersRepository.findOne.mockResolvedValue({ ...mockUser });
      usersRepository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.update('user-123', { password: 'newpassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(result.password).toBe('newHashedPassword');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.remove('user-123');

      expect(result).toBe(true);
      expect(usersRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
