// src/common/employee-sync.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UserRole } from 'src/users/entities/user.entity';

interface RmsEmployee {
  email: string;
  employee_name: string;
}

@Injectable()
export class EmployeeSyncService {
  private readonly logger = new Logger(EmployeeSyncService.name);
  private readonly rmsUrl = 'https://rms.bmtapps.com/public/api/employeelist';

  constructor(
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncRmsEmployees() {
    this.logger.log('Starting RMS employee sync...');

    try {
      const response = await lastValueFrom(this.httpService.get(this.rmsUrl));

      if (response.status !== 200 || !response.data) {
        this.logger.error('Failed to fetch RMS employee list');
        return;
      }

      const rmsEmployeesRaw = response.data;
      if (!Array.isArray(rmsEmployeesRaw)) {
        this.logger.error('Invalid RMS API response format');
        return;
      }

      // Normalize emails and filter valid entries
      const rmsEmployees: RmsEmployee[] = rmsEmployeesRaw
        .filter((emp: any) => emp.email && emp.employee_name)
        .map((emp: any) => ({
          email: emp.email.toLowerCase(),
          employee_name: emp.employee_name,
        }));

      const rmsMap = new Map<string, RmsEmployee>(rmsEmployees.map((emp) => [emp.email, emp]));

      // Get all active users
      const dbUsers = await this.usersService.findAll(); // returns only active users
      const dbMap = new Map<string, any>(dbUsers.map((user) => [user.email.toLowerCase(), user]));

      const added: string[] = [];
      const updated: string[] = [];
      const removed: string[] = [];

      // Add or update users
      for (const [email, emp] of rmsMap.entries()) {
        const dbUser = dbMap.get(email);
        if (!dbUser) {
          await this.usersService.create({
            email: emp.email,
            name: emp.employee_name,
            password: '',
            role: 'employee' as UserRole,
            managerId: null,
          });
          added.push(emp.email);
        } else if (dbUser.name !== emp.employee_name) {
          await this.usersService.update(dbUser.id, {
            name: emp.employee_name,
          });
          updated.push(emp.email);
        }
      }

      // Soft-delete users not in RMS
      for (const [email, dbUser] of dbMap.entries()) {
        if (!rmsMap.has(email)) {
          await this.usersService.remove(dbUser.id); // now soft delete
          removed.push(dbUser.email);
        }
      }

      // Cache employees for 1 hour
      await this.cacheManager.set('employees', rmsEmployees, 3600);

      if (added.length) this.logger.log(`Added users: ${added.join(', ')}`);
      if (updated.length) this.logger.log(`Updated users: ${updated.join(', ')}`);
      if (removed.length) this.logger.log(`Soft-deleted users: ${removed.join(', ')}`);

      this.logger.log('RMS employee sync completed.');
    } catch (error) {
      this.logger.error('Error syncing RMS employees', error?.message || error.stack);
    }
  }

  async getCachedEmployees(): Promise<RmsEmployee[]> {
    const cached = await this.cacheManager.get<RmsEmployee[]>('employees');
    if (cached) return cached;

    await this.syncRmsEmployees();
    const refreshed = await this.cacheManager.get<RmsEmployee[]>('employees');
    return refreshed || [];
  }
}
