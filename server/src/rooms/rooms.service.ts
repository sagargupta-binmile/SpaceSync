import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomDto } from './dto/room.dto';

export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepositery: Repository<Room>,
  ) {}

  // create rooms
  async create(roomData: RoomDto): Promise<Room> {
    const room = this.roomRepositery.create(roomData);
    return this.roomRepositery.save(room);
  }

 
  async fetchAll(): Promise<RoomDto[]> {
  return this.roomRepositery
    .createQueryBuilder('room')
    .getRawMany(); 
}

}
