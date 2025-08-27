import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoomDto } from './dto/room.dto';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomService: RoomsService) {}
  @Post()
  create(@Body() roomdto: RoomDto): Promise<RoomDto> {
    return this.roomService.create(roomdto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  fetchAll(): Promise<RoomDto[]> {
    return this.roomService.fetchAll();
  }
}
