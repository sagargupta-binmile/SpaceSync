import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RoomSchema } from './dto/room.dto';
import type { RoomDto } from './dto/room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomService: RoomsService) {}

  @Post()
  create(@Body(new ZodValidationPipe(RoomSchema)) roomDto: RoomDto): Promise<RoomDto> {
    return this.roomService.create(roomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  fetchAll(): Promise<RoomDto[]> {
    return this.roomService.fetchAll();
  }
}
