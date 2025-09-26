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

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'text', nullable: true })
  recurrenceRule?: string |null;

  @Column({ type: 'datetime', nullable: true })
  recurrenceEndDate?: Date |null;

  @Column({ type: 'char', length: 36, nullable: true })
  recurrenceId?: string |null;

  
  @Column({ type: 'varchar', length: 100, nullable: true })
  slackChannelId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  slackMessageTs?: string;
}
