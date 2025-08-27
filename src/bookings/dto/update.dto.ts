import { IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDto {
  @IsUUID()
  room_id: string; // relation to Room (UUID since entity uses uuid PK)

  @IsUUID()
  booking_id: string; // relation to User (UUID since entity uses uuid PK)

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;
}
