import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios'; // ✅ Import this
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    CommonModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dedede123',
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
