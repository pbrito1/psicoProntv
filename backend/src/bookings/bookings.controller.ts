import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingAccessGuard } from '../guards/booking-access.guard';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('date') date?: string, @Request() req?: any) {
    if (req?.user?.role === 'THERAPIST') {
      const therapistId = req.user.userId || req.user.sub;
      return this.bookingsService.findByTherapist(therapistId, date);
    }
    return this.bookingsService.findAllForDay(date);
  }

  @Get(':id')
  @UseGuards(BookingAccessGuard)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(Number(id));
  }

  @Roles('ADMIN', 'THERAPIST')
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Roles('ADMIN', 'THERAPIST')
  @UseGuards(BookingAccessGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(Number(id), dto);
  }

  @Roles('ADMIN', 'THERAPIST')
  @UseGuards(BookingAccessGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(Number(id));
  }
}
