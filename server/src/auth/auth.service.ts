// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmployeeSyncService } from 'src/common/employee-sync.service';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly employeeSyncService: EmployeeSyncService,
  ) {}

  async loginWithGmail(email: string): Promise<AuthResponseDto> {
    if (!email.endsWith('@binmile.com')) {
      throw new UnauthorizedException('Only @binmile.com emails are allowed');
    }

    const normalizedEmail = email.toLowerCase();

    // 1️⃣ Use cached employees to validate
    const employees = (await this.employeeSyncService.getCachedEmployees()) || [];
    const userData = employees.find((emp) => emp.email === normalizedEmail);

    if (!userData) {
      throw new UnauthorizedException('User not found in RMS');
    }

    // 2️⃣ Check if user exists in DB using normalized email
    let user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      // Create user if not present in DB
      user = await this.usersService.create({
        email: normalizedEmail,
        name: userData.employee_name,
        password: '',
        role: 'employee' as UserRole,
        managerId: null,
      });
    }

    // 3️⃣ Create JWT token
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
