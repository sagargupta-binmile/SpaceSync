import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

interface RmsEmployee {
  email: string;
  employee_name: string;
  role?: string;
}

@Injectable()
export class EmployeeSyncService {
  private readonly logger = new Logger(EmployeeSyncService.name);
  private readonly rmsUrl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.rmsUrl = this.configService.get('RMS_URL')?.toString() || '';
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async syncRmsEmployees() {
    this.logger.log('Starting RMS employee sync...');
    try {
      if (!this.rmsUrl) {
        this.logger.error('RMS URL is not defined');
        return;
      }

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

      const rmsEmployees: RmsEmployee[] = rmsEmployeesRaw
        .filter((emp: any) => emp.email && emp.employee_name)
        .map((emp: any) => ({
          email: emp.email.toLowerCase(),
          employee_name: emp.employee_name,
          role: emp.role_name || 'employee',
        }));

      const dbUsersResult = await this.usersService.findAll();
      const dbUsers = dbUsersResult.users;
      const dbMap = new Map<string, any>(dbUsers.map((user) => [user.email.toLowerCase(), user]));

      const added: string[] = [];
      const updated: string[] = [];
      const removed: string[] = [];

      // Upsert users safely
      for (const emp of rmsEmployees) {
        const dbUser = dbMap.get(emp.email);
        if (!dbUser) {
          // Only create if user does not exist
          await this.usersService.create({
            email: emp.email,
            name: emp.employee_name,
            role: emp.role,
          });
          added.push(emp.email);
        } else if (dbUser.name !== emp.employee_name || dbUser.role !== emp.role) {
          
          await this.usersService.update(dbUser.id, {
            name: emp.employee_name,
            role: emp.role,
          });
          updated.push(emp.email);
        }
      }

      // Soft-remove users not in RMS
      for (const dbUser of dbUsers) {
        if (!rmsEmployees.find((e) => e.email === dbUser.email.toLowerCase())) {
          await this.usersService.remove(dbUser.id);
          removed.push(dbUser.email);
        }
      }

      // Update cache
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
