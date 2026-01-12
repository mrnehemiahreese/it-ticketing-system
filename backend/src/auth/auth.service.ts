import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.usersService.findByUsername(loginInput.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isDisabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const user = await this.usersService.create({
      ...registerInput,
      roles: [Role.USER], // Default role for new registrations
    });

    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (user && await this.usersService.validatePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
