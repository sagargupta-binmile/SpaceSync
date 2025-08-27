import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/Register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // validate user during login
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // signup new user
  async signup(registerDto: RegisterDto): Promise<User> {
    const { email, name, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersService.create({ email, name, password: hashedPassword });
  }

  // login user

  async login(user: { id: string; email: string }): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
