import { IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingDto {
  @IsUUID()
  room_id: string; // relation to Room (UUID since entity uses uuid PK)

  @IsUUID()
  employee_id: string; // relation to User (UUID since entity uses uuid PK)

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;
}
