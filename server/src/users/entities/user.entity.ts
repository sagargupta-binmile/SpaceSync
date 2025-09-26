import { Booking } from 'src/bookings/entities/booking.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string;
  @Column({default:false})
  isBlocked:boolean;

  @OneToMany(() => Booking, (booking) => booking.user, { cascade: true })
  bookings: Booking[];
}
