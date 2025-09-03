import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    try {
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.email }
      });

      if (existingClient) {
        throw new BadRequestException('Já existe um cliente com este email');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new BadRequestException('Email inválido');
      }

      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(dto.phone.replace(/\D/g, ''))) {
        throw new BadRequestException('Telefone inválido');
      }

      if (!phoneRegex.test(dto.emergencyPhone.replace(/\D/g, ''))) {
        throw new BadRequestException('Telefone de emergência inválido');
      }

      const birthDate = new Date(dto.birthDate);
      if (isNaN(birthDate.getTime())) {
        throw new BadRequestException('Data de nascimento inválida');
      }

      if (birthDate > new Date()) {
        throw new BadRequestException('Data de nascimento não pode ser no futuro');
      }

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (birthDate > oneYearAgo) {
        throw new BadRequestException('Data de nascimento inválida - cliente muito jovem');
      }

      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);
      if (birthDate < maxAge) {
        throw new BadRequestException('Data de nascimento inválida - idade muito avançada');
      }

      if (!dto.address || dto.address.trim().length < 10) {
        throw new BadRequestException('Endereço deve ter pelo menos 10 caracteres');
      }

      if (!dto.emergencyContact || dto.emergencyContact.trim().length < 3) {
        throw new BadRequestException('Contato de emergência deve ter pelo menos 3 caracteres');
      }

      if (!dto.name || dto.name.trim().length < 2) {
        throw new BadRequestException('Nome deve ter pelo menos 2 caracteres');
      }

      const data = {
        ...dto,
        birthDate,
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone.trim(),
        emergencyPhone: dto.emergencyPhone.trim(),
        address: dto.address.trim(),
        emergencyContact: dto.emergencyContact.trim(),
        medicalHistory: dto.medicalHistory?.trim() || null,
        currentMedications: dto.currentMedications?.trim() || null,
        allergies: dto.allergies?.trim() || null
      };

      return await this.prisma.client.create({ data });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar cliente');
    }
  }

  async findAll(therapistId?: number) {
    if (therapistId) {
      return await this.prisma.client.findMany({
        where: {
          therapists: {
            some: {
              therapistId,
              endDate: null
            }
          }
        },
        include: {
          guardians: {
            where: { isActive: true },
            select: { id: true, name: true, relationship: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    return await this.prisma.client.findMany({
      include: {
        guardians: {
          where: { isActive: true },
          select: { id: true, name: true, relationship: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        guardians: {
          where: { isActive: true },
          select: { id: true, name: true, relationship: true }
        },
        therapists: {
          where: { endDate: null },
          include: {
            therapist: {
              select: { id: true, name: true, specialty: true }
            }
          }
        }
      }
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    try {
      await this.findOne(id);

      if (dto.email) {
        const existingClient = await this.prisma.client.findFirst({
          where: {
            email: dto.email,
            id: { not: id }
          }
        });

        if (existingClient) {
          throw new ConflictException('Já existe outro cliente com este email');
        }
      }

      let data: any = { ...dto };

      if (dto.birthDate) {
        const birthDate = new Date(dto.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new BadRequestException('Data de nascimento inválida');
        }
        data.birthDate = birthDate;
      }

      if (dto.name) {
        data.name = dto.name.trim();
      }

      if (dto.email) {
        data.email = dto.email.toLowerCase().trim();
      }

      if (dto.phone) {
        data.phone = dto.phone.trim();
      }

      if (dto.emergencyPhone) {
        data.emergencyPhone = dto.emergencyPhone.trim();
      }

      if (dto.address) {
        data.address = dto.address.trim();
      }

      if (dto.emergencyContact) {
        data.emergencyContact = dto.emergencyContact.trim();
      }

      if (dto.medicalHistory !== undefined) {
        data.medicalHistory = dto.medicalHistory?.trim() || null;
      }

      if (dto.currentMedications !== undefined) {
        data.currentMedications = dto.currentMedications?.trim() || null;
      }

      if (dto.allergies !== undefined) {
        data.allergies = dto.allergies?.trim() || null;
      }

      return await this.prisma.client.update({
        where: { id },
        data,
        include: {
          guardians: {
            where: { isActive: true },
            select: { id: true, name: true, relationship: true }
          }
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar cliente');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const activeBookings = await this.prisma.booking.findMany({
        where: {
          clientId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com agendamentos ativos');
      }

      const medicalRecords = await this.prisma.medicalRecord.findMany({
        where: { clientId: id }
      });

      if (medicalRecords.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com prontuários médicos');
      }

      const activeTherapistRelations = await this.prisma.clientTherapist.findMany({
        where: {
          clientId: id,
          endDate: null
        }
      });

      if (activeTherapistRelations.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com relacionamentos ativos com terapeutas');
      }

      const pendingNotifications = await this.prisma.notification.findMany({
        where: {
          clientId: id,
          isRead: false
        }
      });

      if (pendingNotifications.length > 0) {
        await this.prisma.notification.updateMany({
          where: { clientId: id },
          data: { isRead: true }
        });
      }

      return await this.prisma.client.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir cliente');
    }
  }

  async addTherapistToClient(clientId: number, therapistId: number, isPrimary: boolean = false) {
    const existingRelation = await this.prisma.clientTherapist.findFirst({
      where: {
        clientId,
        therapistId
      }
    });

    if (existingRelation) {
      if (existingRelation.endDate) {
        await this.prisma.clientTherapist.update({
          where: { id: existingRelation.id },
          data: { endDate: null, isPrimary }
        });
        return { message: 'Relacionamento reativado com sucesso' };
      }

      if (isPrimary && !existingRelation.isPrimary) {
        await this.prisma.clientTherapist.update({
          where: { id: existingRelation.id },
          data: { isPrimary }
        });
        return { message: 'Relacionamento atualizado com sucesso' };
      }

      return { message: 'Relacionamento já existe' };
    }

    if (isPrimary) {
      await this.prisma.clientTherapist.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    await this.prisma.clientTherapist.create({
      data: {
        clientId,
        therapistId,
        isPrimary,
        startDate: new Date()
      }
    });

    return { message: 'Terapeuta vinculado ao cliente com sucesso' };
  }

  async removeTherapistFromClient(clientId: number, therapistId: number) {
    const relation = await this.prisma.clientTherapist.findFirst({
      where: {
        clientId,
        therapistId
      }
    });

    if (!relation) {
      throw new NotFoundException('Relacionamento não encontrado');
    }

    const activeBookings = await this.prisma.booking.findMany({
      where: {
        clientId,
        therapistId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings.length > 0) {
      throw new BadRequestException('Não é possível remover terapeuta com agendamentos ativos');
    }

    const recentMedicalRecords = await this.prisma.medicalRecord.findMany({
      where: {
        clientId,
        therapistId,
        sessionDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    if (recentMedicalRecords.length > 0) {
      throw new BadRequestException('Não é possível remover terapeuta com prontuários médicos recentes');
    }

    await this.prisma.clientTherapist.update({
      where: { id: relation.id },
      data: { endDate: new Date() }
    });

    return { message: 'Terapeuta removido do cliente com sucesso' };
  }

  async endAllClientRelationships(clientId: number) {
    await this.prisma.clientTherapist.updateMany({
      where: {
        clientId,
        endDate: null
      },
      data: { endDate: new Date() }
    });

    return { message: 'Todos os relacionamentos do cliente foram encerrados' };
  }

  async endAllTherapistRelationships(therapistId: number) {
    await this.prisma.clientTherapist.updateMany({
      where: {
        therapistId,
        endDate: null
      },
      data: { endDate: new Date() }
    });

    return { message: 'Todos os relacionamentos do terapeuta foram encerrados' };
  }

  async getClientTherapists(clientId: number) {
    return await this.prisma.clientTherapist.findMany({
      where: {
        clientId,
        endDate: null
      },
      include: {
        therapist: {
          select: { id: true, name: true, specialty: true }
        }
      },
      orderBy: { isPrimary: 'desc' }
    });
  }
}
