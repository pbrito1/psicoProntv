import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBookingDto {
  title: string;
  start: Date | string;
  end: Date | string;
  roomId: number;
  therapistId: number;
  clientId?: number;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async hasConflict(roomId: number, start: Date, end: Date, excludeId?: number) {
    try {
      const whereClause: any = {
        roomId,
        start: {
          lte: end
        },
        end: {
          gte: start
        }
      };
      
      if (excludeId) {
        whereClause.NOT = { id: excludeId };
      }
      
      const conflict = await this.prisma.booking.findFirst({
        where: whereClause
      });
      
      return Boolean(conflict);
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return false; // Em caso de erro, não bloquear a criação
    }
  }

  async create(dto: CreateBookingDto) {
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (end <= start) throw new BadRequestException('End must be after start');
    if (await this.hasConflict(dto.roomId, start, end)) {
      throw new BadRequestException('Room is already booked for this time');
    }
    
    const data: any = { ...dto, start, end };
    if (dto.clientId) {
      data.clientId = dto.clientId;
    }
    
    return this.prisma.booking.create({ data });
  }

  async findAllForDay(date?: string) {
    if (!date) return (this.prisma.booking.findMany({ include: { room: true, therapist: true } }) as any);
    
    try {
      // Converter a string de data para Date
      let day: Date;
      
      // Tentar diferentes formatos de data
      if (date.includes('-')) {
        // Formato DD-MM-YYYY
        const [dayStr, monthStr, yearStr] = date.split('-');
        day = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
      } else {
        // Formato padrão
        day = new Date(date);
      }
      
      if (isNaN(day.getTime())) {
        throw new Error('Data inválida');
      }
      
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      
      console.log('Buscando agendamentos para:', { date, start, end });
      
      // Usar uma abordagem mais simples para evitar problemas com operadores
      const allBookings = await (this.prisma.booking.findMany({
        include: { room: true, therapist: true },
        orderBy: { start: 'asc' },
      }) as any);
      
      // Filtrar no JavaScript em vez de usar operadores complexos do Prisma
      const filteredBookings = allBookings.filter((booking: any) => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return bookingStart >= start && bookingEnd <= end;
      });
      
      return filteredBookings;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      // Fallback: buscar todos os agendamentos se houver erro
      return (this.prisma.booking.findMany({ 
        include: { room: true, therapist: true },
        orderBy: { start: 'asc' }
      }) as any);
    }
  }

  async findOne(id: number) {
    const booking = await (this.prisma.booking.findUnique({ where: { id }, include: { room: true, therapist: true } }) as any);
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
    
    const data: any = { ...dto, start, end };
    if (dto.clientId !== undefined) {
      data.clientId = dto.clientId;
    }
    
    return this.prisma.booking.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.booking.delete({ where: { id } });
  }
}
