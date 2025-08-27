import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookingDto } from './dto/booking.dto';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateDto } from './dto/update.dto';

export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepositery: Repository<Booking>,
  ) {}
  async create(bookingDto: BookingDto): Promise<string> {
    const { room_id, employee_id, startTime, endTime } = bookingDto;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startObj < new Date()) {
      throw new BadRequestException('Start time must be in future');
    }
    if (endObj <= startObj) {
      throw new BadRequestException('End time must be greater than start time');
    }

    const alreadyBooked = await this.bookingRepositery
      .createQueryBuilder('b')
      .where('b.room = :room_id OR b.user = :employee_id', {
        room_id,
        employee_id,
      })
      .andWhere('b.endTime > :startTime', { startTime: startObj })
      .andWhere('b.startTime < :endTime', { endTime: endObj })
      .getOne();

    if (alreadyBooked) {
      throw new ConflictException('Room is already booked in this time slot');
    }

    const newBooking = new Booking();
    newBooking.room = { id: room_id } as Room;
    newBooking.user = { id: employee_id } as User;
    newBooking.startTime = startObj;
    newBooking.endTime = endObj;

    await this.bookingRepositery.save(newBooking);
    return 'Booking created successfully';
  }

  async updateBooking(updateDto: UpdateDto): Promise<string> {
    const { room_id, booking_id, startTime, endTime } = updateDto;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);

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
    });
    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    const alreadyBooked = await this.bookingRepositery
      .createQueryBuilder('b')
      .where('b.room = :room_id', { room_id })
      .andWhere('b.id != :booking_id', { booking_id })
      .andWhere('b.endTime > :startTime', { startTime: startObj })
      .andWhere('b.startTime < :endTime', { endTime: endObj })
      .getOne();

    if (alreadyBooked) {
      throw new ConflictException('Room is already booked in this time slot');
    }

    existingBooking.startTime = startObj;
    existingBooking.endTime = endObj;

    await this.bookingRepositery.save(existingBooking);
    return 'Updated successfully';
  }

  async deleteBooking(booking_id: string): Promise<string> {
    const existingBooking = await this.bookingRepositery.findOne({
      where: { id: booking_id },
    });
    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }
    await this.bookingRepositery.remove(existingBooking);
    return 'Deleted successfully';
  }

  async fetcAllBookings(): Promise<any[]> {
    const bookings = await this.bookingRepositery.find();
    return bookings.map((booking) => ({
      booking_id: booking.id,
      room_id: booking.room.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));
  }

  async fetcAllBookingsBySingleUser(employee_id: string): Promise<any[]> {
    const bookings = await this.bookingRepositery
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'room')
      .leftJoinAndSelect('b.user', 'user')
      .where('user.id = :employee_id', { employee_id })
      .getMany();

    return bookings.map((booking) => ({
      booking_id: booking.id,
      room_id: booking.room.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));
  }
}
