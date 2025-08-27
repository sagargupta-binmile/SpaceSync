import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/Register.dto';
import { LoginDto } from './dto/Login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() registerDto: RegisterDto) {
    return this.authService.signup(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }
}
