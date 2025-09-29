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
import { UpdateBookingSchema } from './dto/update.dto';
import type { UpdateBookingDto } from './dto/update.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(new ZodValidationPipe(BookingSchema)) bookingDto: BookingDto, @Req() req) {
    const googleTokens = {
      accessToken: req.user.googleAccessToken,
      refreshToken: req.user.googleRefreshToken,
    };

    return this.bookingsService.createBooking(
      bookingDto,
      process.env.SLACK_DEFAULT_CHANNEL,
      googleTokens,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getBookings(
    @Query('role') role: string,
    @Query('userId') userId?: string,
    @Query('page') page = 1,
    @Query('roomId') roomId?: string,
    @Query('filterMode') filterMode?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.bookingsService.fetchAllBookings(
      userId,
      role,
      +page,
      roomId,
      filterMode,
      fromDate,
      toDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateBookings(
    @Body(new ZodValidationPipe(UpdateBookingSchema)) updateDto: UpdateBookingDto,
    @Req() req,
  ) {
    const googleTokens = {
      accessToken: req.user.googleAccessToken,
      refreshToken: req.user.googleRefreshToken,
    };
    return this.bookingsService.updateBooking(updateDto, googleTokens);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':booking_id')
  deleteBookings(
    @Param('booking_id') booking_id: string,
    @Body('deleteSeries') deleteSeries: boolean,
  ) {
    return this.bookingsService.deleteBooking(booking_id, deleteSeries);
  }
  @UseGuards(JwtAuthGuard)
  @Get('global')
  async getGlobalCalendar(@Query('from') from: string, @Query('to') to: string) {
    return this.bookingsService.getGlobalBookings(from, to);
  }
}
