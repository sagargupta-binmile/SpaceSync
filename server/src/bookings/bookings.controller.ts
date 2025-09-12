import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BookingSchema } from './dto/booking.dto';
import type { BookingDto } from './dto/booking.dto';
import { BookingsService } from './bookings.service';
import { UpdateSchema } from './dto/update.dto';
import type { UpdateDto } from './dto/update.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(new ZodValidationPipe(BookingSchema)) bookingDto: BookingDto) {
    return this.bookingsService.create(bookingDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  getBookings(@Req() req, @Query('userId') userId?: string, @Query('page') page = 1) {
    const role = req.user?.role; // 'employee', 'manager', or 'admin'
    return this.bookingsService.fetcAllBookings(userId, role, +page);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateBookings(@Body(new ZodValidationPipe(UpdateSchema)) updateDto: UpdateDto) {
    return this.bookingsService.updateBooking(updateDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':booking_id')
  deleteBookings(@Param('booking_id') booking_id: string) {
    return this.bookingsService.deleteBooking(booking_id);
  }
}
