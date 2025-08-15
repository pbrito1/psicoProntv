import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.room.create({ data });
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

  remove(id: number) {
    return this.prisma.room.delete({ where: { id } });
  }
}
