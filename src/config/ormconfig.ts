//import { TypeOrmModuleOptions } from '@nestjs/typeorm';
//import { Booking } from 'src/bookings/entities/booking.entity';
//import { Room } from 'src/rooms/entities/room.entity';
//import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
export const typeOrmModule: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'nestDB',
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'], // ✅ make sure entities load after build
  migrations: ['dist/migrations/*{.ts,.js}'], // ✅ correct migrations path
  migrationsRun: true,
};
export const AppDataSource = new DataSource(typeOrmModule);
