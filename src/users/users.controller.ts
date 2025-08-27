import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  fetchAll(): Promise<User[]> {
    return this.userService.fetchAll();
  }
}
