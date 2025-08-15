import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBookingDto {
  title: string;
  start: Date | string;
  end: Date | string;
  roomId: number;
  therapistId: number;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async hasConflict(roomId: number, start: Date, end: Date, excludeId?: number) {
    const conflict = await this.prisma.booking.findFirst({
      where: {
        roomId,
        NOT: excludeId ? { id: excludeId } : undefined,
        OR: [
          { start: { lte: end }, end: { gte: start } },
        ],
      },
    });
    return Boolean(conflict);
  }

  async create(dto: CreateBookingDto) {
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (end <= start) throw new BadRequestException('End must be after start');
    if (await this.hasConflict(dto.roomId, start, end)) {
      throw new BadRequestException('Room is already booked for this time');
    }
    return this.prisma.booking.create({ data: { ...dto, start, end } });
  }

  findAllForDay(date?: string) {
    if (!date) return this.prisma.booking.findMany({ include: { room: true, therapist: true } });
    const day = new Date(date);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    return this.prisma.booking.findMany({
      where: { start: { gte: start }, end: { lte: end } },
      include: { room: true, therapist: true },
      orderBy: { start: 'asc' },
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { room: true, therapist: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: number, dto: UpdateBookingDto) {
    const current = await this.findOne(id);
    const start = dto.start ? new Date(dto.start) : current.start;
    const end = dto.end ? new Date(dto.end) : current.end;
    const roomId = dto.roomId ?? current.roomId;
    if (end <= start) throw new BadRequestException('End must be after start');
    if (await this.hasConflict(roomId, start, end, id)) {
      throw new BadRequestException('Room is already booked for this time');
    }
    return this.prisma.booking.update({ where: { id }, data: { ...dto, start, end } });
  }

  remove(id: number) {
    return this.prisma.booking.delete({ where: { id } });
  }
}
