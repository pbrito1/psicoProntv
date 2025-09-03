import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  private async hasConflict(roomId: number, start: Date, end: Date, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = {
        roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            start: { lt: end },
            end: { gt: start }
          }
        ]
      };
      
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }
      
      const conflict = await this.prisma.booking.findFirst({
        where: whereClause
      });
      
      return Boolean(conflict);
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return false;
    }
  }

  async create(dto: CreateBookingDto) {
    try {
      const start = new Date(dto.start);
      const end = new Date(dto.end);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Datas inválidas');
      }
      
      if (end <= start) {
        throw new BadRequestException('Data de fim deve ser posterior à data de início');
      }

      if (start < new Date()) {
        throw new BadRequestException('Não é possível criar agendamentos no passado');
      }

      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      
      if (durationMinutes < 15) {
        throw new BadRequestException('Agendamento deve ter pelo menos 15 minutos');
      }
      
      if (durationMinutes > 240) {
        throw new BadRequestException('Agendamento não pode ter mais de 4 horas');
      }

      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId }
      });

      if (!room) {
        throw new BadRequestException('Sala não encontrada');
      }

      const therapist = await this.prisma.user.findUnique({
        where: { id: dto.therapistId }
      });

      if (!therapist) {
        throw new BadRequestException('Terapeuta não encontrado');
      }

      if (dto.clientId) {
        const client = await this.prisma.client.findUnique({
          where: { id: dto.clientId }
        });

        if (!client) {
          throw new BadRequestException('Cliente não encontrado');
        }

        const relationship = await this.prisma.clientTherapist.findFirst({
          where: {
            clientId: dto.clientId,
            therapistId: dto.therapistId,
            endDate: null
          }
        });

        if (!relationship) {
          throw new BadRequestException('Terapeuta não tem relacionamento ativo com este cliente');
        }
      }

      if (await this.hasConflict(dto.roomId, start, end)) {
        throw new BadRequestException('Sala já está reservada para este horário');
      }

      const therapistConflict = await this.prisma.booking.findFirst({
        where: {
          therapistId: dto.therapistId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              start: { lt: end },
              end: { gt: start }
            }
          ]
        }
      });

      if (therapistConflict) {
        throw new BadRequestException('Terapeuta já tem um agendamento neste horário');
      }

      if (dto.clientId) {
        const clientConflict = await this.prisma.booking.findFirst({
          where: {
            clientId: dto.clientId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            OR: [
              {
                start: { lt: end },
                end: { gt: start }
              }
            ]
          }
        });

        if (clientConflict) {
          throw new BadRequestException('Cliente já tem um agendamento neste horário');
        }
      }

      if (room.openingTime && room.closingTime) {
        const startTime = start.toTimeString().slice(0, 5);
        const endTime = end.toTimeString().slice(0, 5);
        
        if (startTime < room.openingTime || endTime > room.closingTime) {
          throw new BadRequestException(`Agendamento deve estar dentro do horário de funcionamento da sala (${room.openingTime} - ${room.closingTime})`);
        }
      }
    
      const data: any = { 
        ...dto, 
        start, 
        end,
        status: 'PENDING'
      };
      
      const booking = await this.prisma.booking.create({ data });
      
      if (dto.clientId) {
        try {
          await this.notificationsService.notifyNewBooking(booking.id);
        } catch (error) {
          console.error('Erro ao criar notificação:', error);
        }
      }
      
      return booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar agendamento');
    }
  }

  async findAllForDay(date?: string) {
    if (!date) return (this.prisma.booking.findMany({ include: { room: true, therapist: true } }) as any);
    
    try {
      let day: Date;
      
      if (date.includes('-')) {
        const [dayStr, monthStr, yearStr] = date.split('-');
        day = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
      } else {
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
      
      const allBookings = await (this.prisma.booking.findMany({
        include: { room: true, therapist: true },
        orderBy: { start: 'asc' },
      }) as any);
      
      const filteredBookings = allBookings.filter((booking: any) => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return bookingStart >= start && bookingEnd <= end;
      });
      
      return filteredBookings;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return (this.prisma.booking.findMany({ 
        include: { room: true, therapist: true },
        orderBy: { start: 'asc' }
      }) as any);
    }
  }

  async findByTherapist(therapistId: number, date?: string) {
    if (!date) {
      return await this.prisma.booking.findMany({
        where: { therapistId },
        include: { 
          room: true, 
          therapist: true,
          client: true
        },
        orderBy: { start: 'asc' }
      });
    }

    try {
      let day: Date;
      
      if (date.includes('-')) {
        const [dayStr, monthStr, yearStr] = date.split('-');
        day = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
      } else {
        day = new Date(date);
      }
      
      if (isNaN(day.getTime())) {
        throw new Error('Data inválida');
      }
      
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      
      const allBookings = await this.prisma.booking.findMany({
        where: { therapistId },
        include: { 
          room: true, 
          therapist: true,
          client: true
        },
        orderBy: { start: 'asc' }
      });
      
      const filteredBookings = allBookings.filter((booking: any) => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return bookingStart >= start && bookingEnd <= end;
      });
      
      return filteredBookings;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do terapeuta:', error);
      return await this.prisma.booking.findMany({
        where: { therapistId },
        include: { 
          room: true, 
          therapist: true,
          client: true
        },
        orderBy: { start: 'asc' }
      });
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
    
    const booking = await this.prisma.booking.update({ where: { id }, data });
    
    if (booking.clientId) {
      try {
        await this.notificationsService.notifyUpdatedBooking(booking.id);
      } catch (error) {
        console.error('Erro ao criar notificação de atualização:', error);
      }
    }
    
    return booking;
  }

  async remove(id: number) {
    try {
      const booking = await this.findOne(id);
      
      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('Este agendamento já foi cancelado');
      }

      if (booking.start < new Date()) {
        throw new BadRequestException('Não é possível cancelar um agendamento que já passou');
      }

      if (booking.clientId) {
        try {
          await this.notificationsService.notifyCancelledBooking(booking.id);
        } catch (error) {
          console.error('Erro ao criar notificação de cancelamento:', error);
        }
      }

      if (booking.medicalRecord) {
        await this.prisma.medicalRecord.update({
          where: { id: booking.medicalRecord.id },
          data: { bookingId: null }
        });
      }

      return await this.prisma.booking.delete({ where: { id } });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao cancelar agendamento');
    }
  }
}
