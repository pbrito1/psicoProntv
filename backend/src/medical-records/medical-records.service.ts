import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: dto.clientId }
      });
      if (!client) {
        throw new BadRequestException('Cliente não encontrado');
      }

      const therapist = await this.prisma.user.findUnique({
        where: { id: dto.therapistId }
      });
      if (!therapist) {
        throw new BadRequestException('Terapeuta não encontrado');
      }

      if (dto.bookingId) {
        const existingRecord = await this.prisma.medicalRecord.findUnique({
          where: { bookingId: dto.bookingId }
        });
        if (existingRecord) {
          throw new BadRequestException('Este agendamento já possui um prontuário');
        }

        const booking = await this.prisma.booking.findUnique({
          where: { id: dto.bookingId }
        });
        if (!booking) {
          throw new BadRequestException('Agendamento não encontrado');
        }
      }

      const sessionDate = new Date(dto.sessionDate);
      if (isNaN(sessionDate.getTime())) {
        throw new BadRequestException('Data da sessão inválida');
      }

      let nextSessionDate: Date | undefined;
      if (dto.nextSessionDate) {
        nextSessionDate = new Date(dto.nextSessionDate);
        if (isNaN(nextSessionDate.getTime())) {
          throw new BadRequestException('Data da próxima sessão inválida');
        }
      }

      const data = {
        ...dto,
        sessionDate,
        nextSessionDate
      };

      return await this.prisma.medicalRecord.create({ 
        data,
        include: {
          client: true,
          therapist: true,
          booking: true
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar prontuário');
    }
  }

  async findAll() {
    return await this.prisma.medicalRecord.findMany({
      include: {
        client: true,
        therapist: true,
        booking: true
      },
      orderBy: { sessionDate: 'desc' }
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        client: true,
        therapist: true,
        booking: {
          include: {
            room: true
          }
        }
      }
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    return record;
  }

  async findByClient(clientId: number) {
    return await this.prisma.medicalRecord.findMany({
      where: { clientId },
      include: {
        client: true,
        therapist: true,
        booking: true
      },
      orderBy: { sessionDate: 'desc' }
    });
  }

  async findByTherapist(therapistId: number) {
    return await this.prisma.medicalRecord.findMany({
      where: { therapistId },
      include: {
        client: true,
        therapist: true,
        booking: true
      },
      orderBy: { sessionDate: 'desc' }
    });
  }

  async findByBooking(bookingId: number) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { bookingId },
      include: {
        client: true,
        therapist: true,
        booking: true
      }
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado para este agendamento');
    }

    return record;
  }

  async search(query: string) {
    return await this.prisma.medicalRecord.findMany({
      where: {
        OR: [
          { subjective: { contains: query, mode: 'insensitive' } },
          { assessment: { contains: query, mode: 'insensitive' } },
          { plan: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        client: true,
        therapist: true,
        booking: true
      },
      orderBy: { sessionDate: 'desc' }
    });
  }

  async update(id: number, dto: UpdateMedicalRecordDto) {
    try {
      await this.findOne(id);

      if (dto.bookingId) {
        const existingRecord = await this.prisma.medicalRecord.findFirst({
          where: {
            bookingId: dto.bookingId,
            id: { not: id }
          }
        });
        if (existingRecord) {
          throw new BadRequestException('Este agendamento já possui outro prontuário');
        }
      }

      let data: any = { ...dto };
      if (dto.sessionDate) {
        const sessionDate = new Date(dto.sessionDate);
        if (isNaN(sessionDate.getTime())) {
          throw new BadRequestException('Data da sessão inválida');
        }
        data.sessionDate = sessionDate;
      }

      if (dto.nextSessionDate) {
        const nextSessionDate = new Date(dto.nextSessionDate);
        if (isNaN(nextSessionDate.getTime())) {
          throw new BadRequestException('Data da próxima sessão inválida');
        }
        data.nextSessionDate = nextSessionDate;
      }

      return await this.prisma.medicalRecord.update({
        where: { id },
        data,
        include: {
          client: true,
          therapist: true,
          booking: true
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar prontuário');
    }
  }

  async remove(id: number) {
    try {
      const medicalRecord = await this.findOne(id);

      if (medicalRecord.bookingId) {
        throw new BadRequestException('Não é possível excluir um prontuário vinculado a um agendamento');
      }

      if (medicalRecord.sessionDate < new Date()) {
        throw new BadRequestException('Não é possível excluir um prontuário de uma sessão que já aconteceu');
      }

      return await this.prisma.medicalRecord.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir prontuário');
    }
  }

  async getClientProgress(clientId: number) {
    const records = await this.prisma.medicalRecord.findMany({
      where: { clientId },
      orderBy: { sessionDate: 'asc' },
      select: {
        sessionDate: true,
        sessionType: true,
        sessionDuration: true,
        subjective: true,
        assessment: true,
        plan: true
      }
    });

    if (records.length === 0) {
      return {
        totalSessions: 0,
        progress: [],
        lastSession: null,
        nextSession: null
      };
    }

    const totalSessions = records.length;
    const lastSession = records[records.length - 1];
    const nextSession = records.find(r => new Date(r.sessionDate) > new Date());

    return {
      totalSessions,
      progress: records,
      lastSession: lastSession.sessionDate,
      nextSession: nextSession?.sessionDate || null
    };
  }

  async getTherapistStats(therapistId: number) {
    const totalRecords = await this.prisma.medicalRecord.count({
      where: { therapistId }
    });

    const recordsThisMonth = await this.prisma.medicalRecord.count({
      where: {
        therapistId,
        sessionDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const averageSessionDuration = await this.prisma.medicalRecord.aggregate({
      where: { therapistId },
      _avg: {
        sessionDuration: true
      }
    });

    return {
      totalRecords,
      recordsThisMonth,
      averageSessionDuration: averageSessionDuration._avg.sessionDuration || 0
    };
  }
}
