import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BookingDto } from './dto/booking.dto';
import { BookingsService } from './bookings.service';
import { UpdateDto } from './dto/update.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() bookingDto: BookingDto) {
    return this.bookingsService.create(bookingDto);
  }
  @Get()
  fetcAllBookings() {
    return this.bookingsService.fetcAllBookings();
  }
  @Get(':employee_id')
  fetcAllBookingBySingleUser(@Param('employee_id') employee_id: string) {
    return this.bookingsService.fetcAllBookingsBySingleUser(employee_id);
  }

  @Patch()
  updateBookings(@Body() updateDto: UpdateDto) {
    return this.bookingsService.updateBooking(updateDto);
  }

  @Delete(':booking_id')
  deleteBookings(@Param('booking_id') booking_id: string) {
    return this.bookingsService.deleteBooking(booking_id);
  }
}
