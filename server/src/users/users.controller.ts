import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { promises } from 'dns';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  fetchAllUser(
    @Query('page') page: number = 1,
    @Query('isActive') isActive?: string,
    @Query('email') email?: string,
    @Query('name') name?: string,
  ) {
    let activeFilter: boolean | undefined = undefined;
    if (isActive === 'true') activeFilter = true;
    else if (isActive === 'false') activeFilter = false;

    return this.userService.findAll(+page, activeFilter, email, name);
  }

  @Patch('/toggle-block')
  blockUser(@Body('email') email: string): Promise<string | null> {
    return this.userService.toggleBlockUser(email);
  }
}
