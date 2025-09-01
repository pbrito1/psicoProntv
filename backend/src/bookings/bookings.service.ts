import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
    try {
      // Validar datas
      const start = new Date(dto.start);
      const end = new Date(dto.end);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Datas inválidas');
      }
      
      if (end <= start) {
        throw new BadRequestException('Data de fim deve ser posterior à data de início');
      }

      // Verificar se a data de início não é no passado
      if (start < new Date()) {
        throw new BadRequestException('Não é possível criar agendamentos no passado');
      }

      // Verificar se a duração é razoável (entre 15 minutos e 4 horas)
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      
      if (durationMinutes < 15) {
        throw new BadRequestException('Agendamento deve ter pelo menos 15 minutos');
      }
      
      if (durationMinutes > 240) {
        throw new BadRequestException('Agendamento não pode ter mais de 4 horas');
      }

      // Verificar se a sala existe
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId }
      });

      if (!room) {
        throw new BadRequestException('Sala não encontrada');
      }

      // Verificar se o terapeuta existe
      const therapist = await this.prisma.user.findUnique({
        where: { id: dto.therapistId }
      });

      if (!therapist) {
        throw new BadRequestException('Terapeuta não encontrado');
      }

      // Verificar se o cliente existe (se fornecido)
      if (dto.clientId) {
        const client = await this.prisma.client.findUnique({
          where: { id: dto.clientId }
        });

        if (!client) {
          throw new BadRequestException('Cliente não encontrado');
        }

        // Verificar se o terapeuta tem relacionamento com o cliente
        const relationship = await this.prisma.clientTherapist.findFirst({
          where: {
            clientId: dto.clientId,
            therapistId: dto.therapistId,
            endDate: null // Relacionamento ativo
          }
        });

        if (!relationship) {
          throw new BadRequestException('Terapeuta não tem relacionamento ativo com este cliente');
        }
      }

      // Verificar conflitos de horário
      if (await this.hasConflict(dto.roomId, start, end)) {
        throw new BadRequestException('Sala já está reservada para este horário');
      }

      // Verificar se o terapeuta não tem outros agendamentos no mesmo horário
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

      // Verificar se o cliente não tem outros agendamentos no mesmo horário (se fornecido)
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

      // Verificar horário de funcionamento da sala
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
        status: 'PENDING' // Status padrão
      };
      
      const booking = await this.prisma.booking.create({ data });
      
      // Criar notificação para os pais se houver cliente
      if (dto.clientId) {
        try {
          await this.notificationsService.notifyNewBooking(booking.id);
        } catch (error) {
          console.error('Erro ao criar notificação:', error);
          // Não falhar a criação do agendamento se a notificação falhar
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
      // Converter a string de data para Date
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
      
      // Filtrar por data
      const filteredBookings = allBookings.filter((booking: any) => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return bookingStart >= start && bookingEnd <= end;
      });
      
      return filteredBookings;
    } catch (error) {
      console.error('Erro ao buscar agendamentos do terapeuta:', error);
      // Fallback: buscar todos os agendamentos do terapeuta se houver erro
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
    
    // Criar notificação de atualização se houver cliente
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
      
      // Verificar se o agendamento já foi cancelado
      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('Este agendamento já foi cancelado');
      }

      // Verificar se o agendamento já passou
      if (booking.start < new Date()) {
        throw new BadRequestException('Não é possível cancelar um agendamento que já passou');
      }

      // Criar notificação de cancelamento se houver cliente
      if (booking.clientId) {
        try {
          await this.notificationsService.notifyCancelledBooking(booking.id);
        } catch (error) {
          console.error('Erro ao criar notificação de cancelamento:', error);
          // Não interromper o processo se a notificação falhar
        }
      }

      // Se houver prontuário vinculado, desvincular
      if (booking.medicalRecord) {
        await this.prisma.medicalRecord.update({
          where: { id: booking.medicalRecord.id },
          data: { bookingId: null }
        });
      }

      // Deletar o agendamento
      return await this.prisma.booking.delete({ where: { id } });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao cancelar agendamento');
    }
  }
}
