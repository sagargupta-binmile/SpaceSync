import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { EmployeeSyncService } from './employee-sync.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, HttpModule, CacheModule.register()],
  providers: [LoggerService, LoggingInterceptor, EmployeeSyncService],
  exports: [LoggerService, LoggingInterceptor, EmployeeSyncService], // Exporting it so it can be used in interceptors or other modules
})
export class CommonModule {}
