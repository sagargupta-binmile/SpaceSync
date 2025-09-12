import { Controller } from '@nestjs/common';
import type { Request } from 'express';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
}
