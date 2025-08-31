import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { CreateBookingDto } from '../bookings/bookings.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService) {}

  async create(createGuardianDto: CreateGuardianDto) {
    const { password, ...guardianData } = createGuardianDto;
    const passwordHash = await bcrypt.hash(password, 10);
    
    return this.prisma.guardian.create({
      data: {
        ...guardianData,
        passwordHash,
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.guardian.findMany({
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    return guardian;
  }

  async update(id: number, updateGuardianDto: UpdateGuardianDto) {
    await this.findOne(id);
    
    return this.prisma.guardian.update({
      where: { id },
      data: updateGuardianDto,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    return this.prisma.guardian.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getGuardianProfile(guardianId: number) {
    return this.prisma.guardian.findUnique({
      where: { id: guardianId },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async getGuardianChildren(guardianId: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            bookings: {
              where: {
                start: {
                  gte: new Date(),
                },
              },
              orderBy: {
                start: 'asc',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    return guardian.clients;
  }

  async validateChildAccess(guardianId: number, childId: number) {
    const access = await this.prisma.guardian.findFirst({
      where: {
        id: guardianId,
        clients: { some: { id: childId } },
        isActive: true,
      },
    });

    if (!access) {
      throw new ForbiddenException('Acesso negado a este cliente');
    }

    return true;
  }

  async getChildSessions(childId: number) {
    return this.prisma.booking.findMany({
      where: {
        clientId: childId,
      },
      include: {
        room: true,
        therapist: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });
  }

  async bookSession(childId: number, bookingData: CreateBookingDto) {
    // Verificar se o horário está disponível
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId: bookingData.roomId,
        start: {
          lt: bookingData.end,
        },
        end: {
          gt: bookingData.start,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (conflictingBooking) {
      throw new ForbiddenException('Horário não disponível');
    }

    return this.prisma.booking.create({
      data: {
        ...bookingData,
        clientId: childId,
        status: 'PENDING',
      },
      include: {
        room: true,
        therapist: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });
  }

  async getChildMedicalRecords(childId: number) {
    return this.prisma.medicalRecord.findMany({
      where: {
        clientId: childId,
      },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        sessionDate: 'desc',
      },
    });
  }

  async linkChildToGuardian(guardianId: number, childId: number) {
    // Verificar se a criança existe
    const child = await this.prisma.client.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verificar se o guardião existe
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    // Adicionar a criança ao guardião
    return this.prisma.guardian.update({
      where: { id: guardianId },
      data: {
        clients: {
          connect: { id: childId },
        },
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });
  }
}
