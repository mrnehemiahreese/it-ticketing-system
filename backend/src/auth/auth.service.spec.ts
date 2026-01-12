import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullname: 'Test User',
    roles: [Role.USER],
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user on successful login', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await service.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user-123',
        roles: [Role.USER],
      });
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'invalid', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled account', async () => {
      usersService.findByUsername.mockResolvedValue({
        ...mockUser,
        isDisabled: true,
      } as any);

      await expect(
        service.login({ username: 'testuser', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user with USER role and return token', async () => {
      const newUser = { ...mockUser, roles: [Role.USER] };
      usersService.create.mockResolvedValue(newUser as any);

      const result = await service.register({
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        fullname: 'New User',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual(newUser);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [Role.USER],
        }),
      );
    });
  });

  describe('validateUser', () => {
    it('should return user data without password on valid credentials', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.username).toBe('testuser');
    });

    it('should return null for invalid credentials', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      usersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
