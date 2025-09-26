import { Booking } from 'src/bookings/entities/booking.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
  @Column()
  capacity:number;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
