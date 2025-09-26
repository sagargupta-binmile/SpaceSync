// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmployeeSyncService } from 'src/common/employee-sync.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly employeeSyncService: EmployeeSyncService,
  ) {}

  async loginWithGmail(email: string, googleAccessToken?: string, googleRefreshToken?: string) {
    if (!email.endsWith('@binmile.com')) {
      throw new UnauthorizedException('Only @binmile.com emails are allowed');
    }

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // create user if not exists
      const employees = await this.employeeSyncService.getCachedEmployees();
      const userData = employees.find((emp) => emp.email === email);
      if (!userData) throw new UnauthorizedException('User not found in RMS');

      user = await this.usersService.create({
        email,
        name: userData.employee_name,
        role: userData.role || 'employee',
      });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      googleAccessToken,
      googleRefreshToken,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
