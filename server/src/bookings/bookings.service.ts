import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateBookingDto } from './dto/update.dto';
import { NotificationService } from 'src/notification/notification.service';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { GoogleCalendarService } from 'src/common/GoogleCalendarService';
import { endOfDay } from 'date-fns';
import { ClientProxy } from '@nestjs/microservices';
import { PushService } from 'src/push/push.service';

export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepositery: Repository<Booking>,
    @Inject('Notification_Service')
    private readonly notificationClient: ClientProxy,

    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly pushService: PushService,
  ) {}

  //helper
  private async ensureNoConflict(
    bookingId: string,
    roomId: string,
    userId: string,
    start: Date,
    end: Date,
  ) {
    const roomConflict = await this.bookingRepositery
      .createQueryBuilder('b')
      .where('b.id != :bookingId', { bookingId })
      .andWhere('b.room = :roomId', { roomId })
      .andWhere('b.endTime >= :start', { start })
      .andWhere('b.startTime <= :end', { end })
      .getOne();

    if (roomConflict) {
      throw new ConflictException(
        `Room conflict on ${start.toDateString()} for ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`,
      );
    }

    const userConflict = await this.bookingRepositery
      .createQueryBuilder('b')
      .where('b.id != :bookingId', { bookingId })
      .andWhere('b.user = :userId', { userId })
      .andWhere('b.endTime >= :start', { start })
      .andWhere('b.startTime <= :end', { end })
      .getOne();

    if (userConflict) {
      throw new ConflictException(
        `User conflict on ${start.toDateString()} for ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`,
      );
    }
  }

  //create
  async createBooking(
    bookingDto: BookingDto,
    slackChannelId?: string,
    googleTokens?: { accessToken: string; refreshToken?: string },
  ): Promise<string> {
    const { room_id, employee_id, startTime, endTime, recurrenceRule, recurrenceEndDate } =
      bookingDto;

    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    // check for user
    const check = await this.usersService.isBlocked(employee_id);
    if (check) {
      throw new UnauthorizedException('"User is not allowed for bookings');
    }

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startObj < new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }
    if (endObj <= startObj) {
      throw new BadRequestException('End time must be greater than start time');
    }

    let savedBookings: Booking[] = [];

    // Run transaction to save all bookings
    await this.bookingRepositery.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder(Room, 'room')
        .setLock('pessimistic_write')
        .where('room.id = :room_id', { room_id })
        .getOne();

      const occurrences: { start: Date; end: Date }[] = [];

      if (recurrenceRule && recurrenceEndDate) {
        const endRecurrence = endOfDay(new Date(recurrenceEndDate));
        let currentStart = new Date(startObj);
        let currentEnd = new Date(endObj);

        while (currentStart <= endRecurrence) {
          occurrences.push({ start: new Date(currentStart), end: new Date(currentEnd) });

          switch (recurrenceRule) {
            case 'DAILY':
              currentStart.setDate(currentStart.getDate() + 1);
              currentEnd.setDate(currentEnd.getDate() + 1);
              break;
            case 'WEEKLY':
              currentStart.setDate(currentStart.getDate() + 7);
              currentEnd.setDate(currentEnd.getDate() + 7);
              break;
            case 'MONTHLY':
              currentStart.setMonth(currentStart.getMonth() + 1);
              currentEnd.setMonth(currentEnd.getMonth() + 1);
              break;
            default:
              throw new BadRequestException('Invalid recurrenceRule');
          }
        }
      } else {
        occurrences.push({ start: startObj, end: endObj });
      }

      const roomEntity = await manager.findOne(Room, { where: { id: room_id } });
      const userEntity = await manager.findOne(User, { where: { id: employee_id } });
      if (!roomEntity) throw new NotFoundException('Room not found');
      if (!userEntity) throw new NotFoundException('User not found');

      const rId: string = uuidv4();

      for (const occ of occurrences) {
        // Check room conflict
        const roomConflict = await manager
          .createQueryBuilder(Booking, 'b')
          .where('b.room = :room_id', { room_id })
          .andWhere('b.endTime >= :startTime', { startTime: occ.start })
          .andWhere('b.startTime <= :endTime', { endTime: occ.end })
          .getOne();

        if (roomConflict) {
          throw new ConflictException(
            `${roomEntity.name} is already booked from ${occ.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${occ.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${occ.start.toDateString()}`,
          );
        }

        // Check user conflict
        const userConflict = await manager
          .createQueryBuilder(Booking, 'b')
          .where('b.user = :employee_id', { employee_id })
          .andWhere('b.endTime >= :startTime', { startTime: occ.start })
          .andWhere('b.startTime <= :endTime', { endTime: occ.end })
          .getOne();

        if (userConflict) {
          throw new ConflictException(
            `"${userEntity.name}" already has a booking for room "${roomEntity.name}" from ${occ.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${occ.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${occ.start.toDateString()}`,
          );
        }

        // Create booking
        const newBooking = manager.create(Booking, {
          room: roomEntity,
          user: userEntity,
          startTime: occ.start,
          endTime: occ.end,
          recurrenceRule: recurrenceRule || undefined,
          recurrenceId: rId,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
          slackChannelId: slackChannelId || undefined,
        });

        const saved = await manager.save(newBooking);
        savedBookings.push(saved);
        console.log('.............sending to calender');
        // --- Google Calendar Integration ---
        if (googleTokens?.accessToken) {
          try {
            await this.notificationClient.emit('send_notification', {
              type: 'CALENDAR',
              tokens: googleTokens,
              event: {
                summary: `Room: ${roomEntity.name}`,
                description: `Booking by ${userEntity.name}`,
                start: occ.start.toISOString(),
                end: occ.end.toISOString(),
                attendeeEmail: userEntity.email,
              },
            });
          } catch (err) {
            console.error('Failed to publish Google Calendar event job', err);
          }
        }
      }
    });

    // --- Outside transaction --- send Slack notification
    console.log('.....sending to slack');
    if (savedBookings.length > 0) {
      const firstBooking = savedBookings[0];
      await this.notificationClient.emit('send_notification', {
        type: 'SLACK',
        recurrenceId: firstBooking.recurrenceId as string,
        employeeName: firstBooking.user?.name || `Employee ${employee_id}`,
        roomName: firstBooking.room?.name || `Room ${room_id}`,
        startTime: firstBooking.startTime,
        endTime: firstBooking.endTime,
        channelId: slackChannelId,
      });

      //super admin
      const superAdmin = await this.usersService.findByEmail('sunit@binmile.com');
      const superAdminId = superAdmin?.id;
      console.log('sending pop up notification',superAdminId)
      if (superAdminId ) {
        await this.pushService.sendNotification(superAdminId, {
          title: ` ${firstBooking.user.name} booked ${firstBooking.room.name} from ${firstBooking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${firstBooking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          message:'' ,
        });
      }
    }

    return 'Booking created successfully';
  }

  //update
  async updateBooking(
    updateDto: UpdateBookingDto,
    googleTokens?: { accessToken: string; refreshToken?: string },
  ): Promise<any> {
    const { booking_id, room_id, start_time, end_time, updateFuture = false } = updateDto;

    if (!booking_id) throw new BadRequestException('Booking ID is required');
    if (!room_id) throw new BadRequestException('Room ID is required');

    const newStart = new Date(start_time);
    const newEnd = new Date(end_time);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (newStart < new Date()) {
      throw new BadRequestException('Start time must be in future');
    }
    if (newEnd <= newStart) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const existingBooking = await this.bookingRepositery.findOne({
      where: { id: booking_id },
      relations: ['room', 'user'],
    });
    if (!existingBooking) throw new NotFoundException('Booking not found');

    const roomEntity = await this.bookingRepositery.manager.findOne(Room, {
      where: { id: room_id },
    });

    let bookingsToUpdate: Booking[] = [];

    if (existingBooking.recurrenceId && updateFuture) {
      bookingsToUpdate = await this.bookingRepositery.find({
        where: { recurrenceId: existingBooking.recurrenceId },
        order: { startTime: 'ASC' },
        relations: ['room', 'user'],
      });

      bookingsToUpdate = bookingsToUpdate.filter((b) => b.startTime >= existingBooking.startTime);

      const deltaStart = newStart.getTime() - existingBooking.startTime.getTime();
      const deltaEnd = newEnd.getTime() - existingBooking.endTime.getTime();

      for (const booking of bookingsToUpdate) {
        const shiftedStart = new Date(booking.startTime.getTime() + deltaStart);
        const shiftedEnd = new Date(booking.endTime.getTime() + deltaEnd);

        await this.ensureNoConflict(booking.id, room_id, booking.user.id, shiftedStart, shiftedEnd);

        booking.startTime = shiftedStart;
        booking.endTime = shiftedEnd;
        booking.room = roomEntity!;

        await this.bookingRepositery.save(booking);

        this.notificationClient.emit('send_notification', {
          type: 'SLACK',
          recurrenceId: booking.recurrenceId,
          employeeName: booking.user?.name || `Employee ${booking.user?.id}`,
          roomName: booking.room?.name || `Room ${booking.room?.id}`,
          startTime: shiftedStart.toISOString(),
          endTime: shiftedEnd.toISOString(),
          channelId: booking.slackChannelId,
        });

        if (googleTokens?.accessToken) {
          this.notificationClient.emit('send_notification', {
            type: 'CALENDAR',
            tokens: googleTokens,
            event: {
              summary: `Room: ${booking.room.name}`,
              description: `Booking by ${booking.user.name}`,
              start: shiftedStart.toISOString(),
              end: shiftedEnd.toISOString(),
              attendeeEmail: booking.user.email,
            },
          });
        }
      }

      return {
        message: `Recurring series updated successfully`,
        updatedCount: bookingsToUpdate.length,
      };
    } else {
      await this.ensureNoConflict(
        existingBooking.id,
        room_id,
        existingBooking.user.id,
        newStart,
        newEnd,
      );

      existingBooking.startTime = newStart;
      existingBooking.endTime = newEnd;
      existingBooking.room = roomEntity!;

      if (existingBooking.recurrenceId) {
        existingBooking.recurrenceId = null;
        existingBooking.recurrenceRule = null;
        existingBooking.recurrenceEndDate = null;
      }

      const saved = await this.bookingRepositery.save(existingBooking);

      this.notificationClient.emit('send_notification', {
        type: 'SLACK',
        recurrenceId: saved.recurrenceId,
        employeeName: saved.user?.name || `Employee ${saved.user?.id}`,
        roomName: saved.room?.name || `Room ${saved.room?.id}`,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        channelId: saved.slackChannelId,
      });

      if (googleTokens?.accessToken) {
        this.notificationClient.emit('send_notification', {
          type: 'CALENDAR',
          tokens: googleTokens,
          event: {
            summary: `Room: ${saved.room.name}`,
            description: `Booking by ${saved.user.name}`,
            start: newStart.toISOString(),
            end: newEnd.toISOString(),
            attendeeEmail: saved.user.email,
          },
        });
      }

      return {
        message: `Single booking updated successfully`,
        booking_id: saved.id,
      };
    }
  }

  //delete
  async deleteBooking(booking_id: string, deleteSeries = false): Promise<string> {
    if (!booking_id) throw new BadRequestException('Booking ID is required');

    const existingBooking = await this.bookingRepositery.findOne({
      where: { id: booking_id },
    });

    if (!existingBooking) throw new NotFoundException('Booking not found');

    if (deleteSeries && existingBooking.recurrenceId) {
      const series = await this.bookingRepositery.find({
        where: { recurrenceId: existingBooking.recurrenceId },
      });

      for (const booking of series) {
        await this.bookingRepositery.softRemove(booking);

        if (booking.slackChannelId && booking.slackMessageTs) {
          await this.notificationService.deleteSlackMessage(
            booking.slackChannelId,
            booking.slackMessageTs,
          );
        }
      }

      return `Deleted recurring series (count: ${series.length}) successfully`;
    } else {
      // Delete only this booking
      await this.bookingRepositery.softRemove(existingBooking);

      if (existingBooking.slackChannelId && existingBooking.slackMessageTs) {
        await this.notificationService.deleteSlackMessage(
          existingBooking.slackChannelId,
          existingBooking.slackMessageTs,
        );
      }

      return 'Deleted booking successfully';
    }
  }

  //fetch
  async fetchAllBookings(
    userId?: string,
    role?: string,
    page: number = 1,
    roomId?: string,
    filterMode?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ bookings: any[]; totalPages: number }> {
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = this.bookingRepositery
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'room')
      .leftJoinAndSelect('b.user', 'user');

    if (userId && role != 'Super Admin') {
      query = query.where('b.user_id = :userId', { userId });
    }

    if (roomId) {
      query = query.andWhere('b.room_id = :roomId', { roomId });
    }

    if (filterMode === 'today') {
      query = query.andWhere('DATE(b.startTime) = CURRENT_DATE');
    } else if (filterMode === 'upcoming') {
      query = query.andWhere('b.startTime >= NOW()');
    } else if (filterMode === 'range' && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      query = query.andWhere('b.startTime <= :toDate AND b.endTime >= :fromDate', {
        fromDate: from,
        toDate: to,
      });
    } else {
      query = query.andWhere('b.startTime >= NOW()');
    }

    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);

    query = query.orderBy('b.startTime', 'DESC').limit(limit).offset(offset);

    const bookings = await query.getMany();

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
        room_id: b.room.id,
        booked_by: b.user.name,
        start_time: b.startTime,
        end_time: b.endTime,
        recurrenceRule: b.recurrenceRule,
        recurrenceEndDate: b.recurrenceEndDate,
        recurrenceId: b.recurrenceId,
        slackChannelId: b.slackChannelId,
        slackMessageTs: b.slackMessageTs,
      });
    });

    return {
      bookings: Array.from(grouped.values()) || [],
      totalPages,
    };
  }
}
