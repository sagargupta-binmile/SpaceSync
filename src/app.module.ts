import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModule } from './config/ormconfig';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    RoomsModule,
    BookingsModule,
    AuthModule,
    TypeOrmModule.forRoot(typeOrmModule),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
