import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingsService } from './bookings.service';
import type { CreateBookingDto, UpdateBookingDto } from './bookings.service';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    return this.bookingsService.findAllForDay(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(Number(id));
  }

  @Roles('ADMIN', 'THERAPIST')
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Roles('ADMIN', 'THERAPIST')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(Number(id), dto);
  }

  @Roles('ADMIN', 'THERAPIST')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(Number(id));
  }
}
