import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @ManyToOne(() => Room, (room) => room.bookings, { eager: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;
  @Column()
  startTime: Date;
  @Column()
  endTime: Date;
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
