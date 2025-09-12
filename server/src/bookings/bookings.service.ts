import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateDto } from './dto/update.dto';
import { NotificationService } from 'src/notification/notification.service';

export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepositery: Repository<Booking>,
    private readonly notificationService: NotificationService,
  ) {}
  async create(bookingDto: BookingDto): Promise<string> {
    const { room_id, employee_id, startTime, endTime } = bookingDto;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startObj < new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }
    if (endObj <= startObj) {
      throw new BadRequestException('End time must be greater than start time');
    }

    return await this.bookingRepositery.manager.transaction(async (manager) => {
      //     Pessimistic lock on room
      await manager
        .createQueryBuilder(Room, 'room')
        .setLock('pessimistic_write')
        .where('room.id = :room_id', { room_id })
        .getOne();

      // Check room conflicts
      const roomConflict = await manager
        .createQueryBuilder(Booking, 'b')
        .where('b.room = :room_id', { room_id })
        .andWhere('b.endTime > :startTime', { startTime: startObj })
        .andWhere('b.startTime < :endTime', { endTime: endObj })
        .getOne();

      if (roomConflict) {
        throw new ConflictException(
          `Room already booked from ${startObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })} to ${endObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}`,
        );
      }

      // Check user conflicts
      const userConflict = await manager
        .createQueryBuilder(Booking, 'b')
        .where('b.user = :employee_id', { employee_id })
        .andWhere('b.endTime > :startTime', { startTime: startObj })
        .andWhere('b.startTime < :endTime', { endTime: endObj })
        .getOne();

      if (userConflict) {
        throw new ConflictException('User already has a booking in this time slot');
      }

      const newBooking = manager.create(Booking, {
        room: { id: room_id } as Room,
        user: { id: employee_id } as User,
        startTime: startObj,
        endTime: endObj,
      });

      await manager.save(newBooking);

      // Fetch full user and room details
      const employee = await manager.findOne(User, {
        where: { id: employee_id },
      });
      const room = await manager.findOne(Room, { where: { id: room_id } });

      // Send Slack notification
      await this.notificationService.sendBookingNotification({
        employeeName: employee ? employee.name : `Employee ${employee_id}`,
        roomName: room ? `${room.name} Room` : `Room ${room_id}`,
        startTime: startObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        endTime: endObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      return 'Booking created successfully';
    });
  }

  // --- updateBooking ---
  async updateBooking(updateDto: UpdateDto): Promise<any> {
    const { room_id, booking_id, start_time, end_time } = updateDto;

    if (!booking_id) throw new BadRequestException('Booking ID is required');
    if (!room_id) throw new BadRequestException('Room ID is required');

    const startObj = new Date(start_time);
    const endObj = new Date(end_time);

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startObj < new Date()) {
      throw new BadRequestException('Start time must be in future');
    }
    if (endObj <= startObj) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const existingBooking = await this.bookingRepositery.findOne({
      where: { id: booking_id },
      relations: ['room', 'user'],
    });
    if (!existingBooking) throw new NotFoundException('Booking not found');

    const alreadyBooked = await this.bookingRepositery
      .createQueryBuilder('b')
      .where('b.room = :room_id', { room_id })
      .andWhere('b.id != :booking_id', { booking_id })
      .andWhere('b.endTime > :startTime', { startTime: startObj })
      .andWhere('b.startTime < :endTime', { endTime: endObj })
      .getOne();

    if (alreadyBooked) {
      throw new ConflictException(
        `Room already booked from ${startObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })} to ${endObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}`,
      );
    }

    existingBooking.startTime = startObj;
    existingBooking.endTime = endObj;

    const saved = await this.bookingRepositery.save(existingBooking);

    // --- Send Slack notification ---
    if (this.notificationService) {
      await this.notificationService.sendBookingNotification({
        employeeName: saved.user?.name || `Employee ${saved.user?.id}`,
        roomName: saved.room?.name || `Room ${saved.room?.id}`,
        startTime: startObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        endTime: endObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }

    return {
      booking_id: saved.id,
      room_id: saved.room?.id || room_id,
      start_time: saved.startTime,
      end_time: saved.endTime,
    };
  }

  // --- deleteBooking ---
  async deleteBooking(booking_id: string): Promise<string> {
    if (!booking_id) throw new BadRequestException('Booking ID is required');

    const existingBooking = await this.bookingRepositery.findOne({
      where: { id: booking_id },
    });

    if (!existingBooking) throw new NotFoundException('Booking not found');

    await this.bookingRepositery.softRemove(existingBooking);

    return 'Deleted successfully';
  }

  async fetcAllBookings(
    userId?: string,
    role?: string,
    page: number = 1,
  ): Promise<{ bookings: any[]; totalPages: number }> {
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = this.bookingRepositery
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'room')
      .leftJoinAndSelect('b.user', 'user');

    // Get total count before applying pagination
    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);

    // Apply pagination
    query = query.orderBy('b.startTime', 'DESC').limit(limit).offset(offset);

    const bookings = await query.getMany();

    // Group bookings by room
    const grouped = new Map<string, any>();
    bookings.forEach((b) => {
      if (!grouped.has(b.room.id)) {
        grouped.set(b.room.id, {
          room_id: b.room.id,
          room_name: b.room.name,
          bookings: [],
        });
      }

      grouped.get(b.room.id).bookings.push({
        booking_id: b.id,
        user_id: b.user.id,
        booked_by: b.user.name,
        start_time: b.startTime,
        end_time: b.endTime,
      });
    });

    return {
      bookings: Array.from(grouped.values()) || [],
      totalPages,
    };
  }
}
