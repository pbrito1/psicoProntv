import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateRoomDto {
  name: string;
  capacity: number;
  resources?: any;
  openingTime?: string | null;
  closingTime?: string | null;
  description?: string | null;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRoomDto) {
    try {
      // Validar nome da sala
      if (!data.name || data.name.trim().length < 2) {
        throw new BadRequestException('Nome da sala deve ter pelo menos 2 caracteres');
      }

      // Validar capacidade
      if (data.capacity < 1 || data.capacity > 100) {
        throw new BadRequestException('Capacidade deve estar entre 1 e 100 pessoas');
      }

      // Validar horários de funcionamento se fornecidos
      if (data.openingTime && data.closingTime) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!timeRegex.test(data.openingTime) || !timeRegex.test(data.closingTime)) {
          throw new BadRequestException('Horários devem estar no formato HH:MM');
        }

        const opening = new Date(`2000-01-01T${data.openingTime}:00`);
        const closing = new Date(`2000-01-01T${data.closingTime}:00`);

        if (opening >= closing) {
          throw new BadRequestException('Horário de abertura deve ser anterior ao horário de fechamento');
        }
      }

      // Verificar se já existe uma sala com o mesmo nome
      return this.prisma.room.findFirst({
        where: { name: data.name }
      }).then(existingRoom => {
        if (existingRoom) {
          throw new BadRequestException('Já existe uma sala com este nome');
        }

        return this.prisma.room.create({ data });
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar sala');
    }
  }

  findAll() {
    return this.prisma.room.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  update(id: number, data: UpdateRoomDto) {
    return this.prisma.room.update({ where: { id }, data });
  }

  async remove(id: number) {
    try {
      // Verificar se a sala existe
      await this.findOne(id);

      // Verificar se há agendamentos ativos para esta sala
      const activeBookings = await this.prisma.booking.findMany({
        where: {
          roomId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir uma sala com agendamentos ativos');
      }

      // Verificar se há agendamentos futuros (mesmo cancelados, para manter histórico)
      const futureBookings = await this.prisma.booking.findMany({
        where: {
          roomId: id,
          start: { gte: new Date() }
        }
      });

      if (futureBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir uma sala com agendamentos futuros');
      }

      return await this.prisma.room.delete({ where: { id } });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir sala');
    }
  }
}
