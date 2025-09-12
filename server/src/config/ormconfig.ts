//import { TypeOrmModuleOptions } from '@nestjs/typeorm';
//import { Booking } from 'src/bookings/entities/booking.entity';
//import { Room } from 'src/rooms/entities/room.entity';
//import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
export const typeOrmModule: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nestDB',
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'], // ✅ make sure entities load after build
  migrations: ['dist/migrations/*{.ts,.js}'], // ✅ correct migrations path
  migrationsRun: true,
};
export const AppDataSource = new DataSource(typeOrmModule);
