import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    try {
      // Verificar se já existe um cliente com o mesmo email
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.email }
      });

      if (existingClient) {
        throw new BadRequestException('Já existe um cliente com este email');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new BadRequestException('Email inválido');
      }

      // Validar telefone
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(dto.phone.replace(/\D/g, ''))) {
        throw new BadRequestException('Telefone inválido');
      }

      // Validar telefone de emergência
      if (!phoneRegex.test(dto.emergencyPhone.replace(/\D/g, ''))) {
        throw new BadRequestException('Telefone de emergência inválido');
      }

      // Converter a string de data para Date
      const birthDate = new Date(dto.birthDate);
      if (isNaN(birthDate.getTime())) {
        throw new BadRequestException('Data de nascimento inválida');
      }

      // Verificar se a data de nascimento não é no futuro
      if (birthDate > new Date()) {
        throw new BadRequestException('Data de nascimento não pode ser no futuro');
      }

      // Verificar se a pessoa não é muito jovem (menos de 1 ano)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (birthDate > oneYearAgo) {
        throw new BadRequestException('Data de nascimento inválida - cliente muito jovem');
      }

      // Verificar se a pessoa não é muito idosa (mais de 120 anos)
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 120);
      if (birthDate < maxAge) {
        throw new BadRequestException('Data de nascimento inválida - idade muito avançada');
      }

      // Validar endereço
      if (!dto.address || dto.address.trim().length < 10) {
        throw new BadRequestException('Endereço deve ter pelo menos 10 caracteres');
      }

      // Validar contato de emergência
      if (!dto.emergencyContact || dto.emergencyContact.trim().length < 3) {
        throw new BadRequestException('Contato de emergência deve ter pelo menos 3 caracteres');
      }

      // Validar nome
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
      // Filtrar apenas clientes do terapeuta específico
      return await this.prisma.client.findMany({
        where: {
          therapists: {
            some: {
              therapistId,
              endDate: null // Apenas relacionamentos ativos
            }
          }
        },
        include: {
          therapists: {
            where: { therapistId },
            select: { isPrimary: true, startDate: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    // Se não especificado, retornar todos (apenas para admins)
    return await this.prisma.client.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findByTherapist(therapistId: number) {
    return await this.prisma.client.findMany({
      where: {
        therapists: {
          some: {
            therapistId,
            endDate: null // Apenas relacionamentos ativos
          }
        }
      },
      include: {
        therapists: {
          where: { therapistId },
          select: { isPrimary: true, startDate: true }
        },
        bookings: {
          where: { therapistId },
          include: { room: true },
          orderBy: { start: 'desc' }
        },
        medicalRecords: {
          where: { therapistId },
          orderBy: { sessionDate: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            room: true,
            therapist: true
          },
          orderBy: { start: 'desc' }
        },
        medicalRecords: {
          include: {
            therapist: true
          },
          orderBy: { sessionDate: 'desc' }
        }
      }
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async findByEmail(email: string) {
    const client = await this.prisma.client.findUnique({
      where: { email }
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async search(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();

    return await this.prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } }
        ]
      },
      orderBy: { name: 'asc' },
      take: 20
    });
  }

  async update(id: number, dto: UpdateClientDto) {
    try {
      // Verificar se o cliente existe
      await this.findOne(id);

      // Se estiver atualizando o email, verificar se não conflita com outro cliente
      if (dto.email) {
        const existingClient = await this.prisma.client.findFirst({
          where: {
            email: dto.email,
            id: { not: id }
          }
        });

        if (existingClient) {
          throw new BadRequestException('Já existe outro cliente com este email');
        }
      }

      // Converter a string de data para Date se fornecida
      let data: any = { ...dto };
      if (dto.birthDate) {
        const birthDate = new Date(dto.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new BadRequestException('Data de nascimento inválida');
        }
        data.birthDate = birthDate;
      }

      return await this.prisma.client.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar cliente');
    }
  }

  async remove(id: number) {
    try {
      // Verificar se o cliente existe
      await this.findOne(id);

      // Verificar se o cliente tem agendamentos ativos
      const activeBookings = await this.prisma.booking.findMany({
        where: {
          clientId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com agendamentos ativos');
      }

      // Verificar se o cliente tem prontuários médicos
      const medicalRecords = await this.prisma.medicalRecord.findMany({
        where: { clientId: id }
      });

      if (medicalRecords.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com prontuários médicos');
      }

      // Verificar se o cliente tem relacionamentos ativos com terapeutas
      const activeTherapistRelations = await this.prisma.clientTherapist.findMany({
        where: {
          clientId: id,
          endDate: null // Relacionamentos ativos
        }
      });

      if (activeTherapistRelations.length > 0) {
        throw new BadRequestException('Não é possível excluir um cliente com relacionamentos ativos com terapeutas');
      }

      // Verificar se há notificações pendentes
      const pendingNotifications = await this.prisma.notification.findMany({
        where: {
          clientId: id,
          isRead: false
        }
      });

      if (pendingNotifications.length > 0) {
        // Marcar notificações como lidas antes de deletar
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

  async getClientStats(id: number) {
    const client = await this.findOne(id);

    const totalBookings = await this.prisma.booking.count({
      where: { clientId: id }
    });

    const completedBookings = await this.prisma.booking.count({
      where: {
        clientId: id,
        status: 'CONFIRMED'
      }
    });

    const totalSessions = await this.prisma.medicalRecord.count({
      where: { clientId: id }
    });

    const lastSession = await this.prisma.medicalRecord.findFirst({
      where: { clientId: id },
      orderBy: { sessionDate: 'desc' },
      select: { sessionDate: true }
    });

    return {
      client,
      stats: {
        totalBookings,
        completedBookings,
        totalSessions,
        lastSession: lastSession?.sessionDate || null
      }
    };
  }

  // NOVO: Métodos para gerenciar relacionamento terapeuta-cliente
  async assignTherapist(clientId: number, therapistId: number, isPrimary: boolean = false) {
    // Verificar se o relacionamento já existe
    const existingRelation = await this.prisma.clientTherapist.findUnique({
      where: {
        clientId_therapistId: {
          clientId,
          therapistId
        }
      }
    });

    if (existingRelation) {
      // Se existe mas foi encerrado, reativar
      if (existingRelation.endDate) {
        return await this.prisma.clientTherapist.update({
          where: { id: existingRelation.id },
          data: { endDate: null, isPrimary }
        });
      }
      // Se já está ativo, apenas atualizar se for primary
      if (isPrimary) {
        return await this.prisma.clientTherapist.update({
          where: { id: existingRelation.id },
          data: { isPrimary }
        });
      }
      return existingRelation;
    }

    // Se for primary, remover primary de outros terapeutas
    if (isPrimary) {
      await this.prisma.clientTherapist.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Criar novo relacionamento
    return await this.prisma.clientTherapist.create({
      data: {
        clientId,
        therapistId,
        isPrimary
      }
    });
  }

  async removeTherapist(clientId: number, therapistId: number) {
    try {
      // Verificar se o relacionamento existe
      const relationship = await this.prisma.clientTherapist.findUnique({
        where: {
          clientId_therapistId: {
            clientId,
            therapistId
          }
        }
      });

      if (!relationship) {
        throw new NotFoundException('Relacionamento terapeuta-cliente não encontrado');
      }

      // Verificar se há agendamentos ativos entre este cliente e terapeuta
      const activeBookings = await this.prisma.booking.findMany({
        where: {
          clientId,
          therapistId,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível remover o terapeuta com agendamentos ativos');
      }

      // Verificar se há prontuários médicos recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentMedicalRecords = await this.prisma.medicalRecord.findMany({
        where: {
          clientId,
          therapistId,
          sessionDate: { gte: thirtyDaysAgo }
        }
      });

      if (recentMedicalRecords.length > 0) {
        throw new BadRequestException('Não é possível remover o terapeuta com prontuários médicos recentes');
      }

      // Marcar o relacionamento como encerrado
      return await this.prisma.clientTherapist.update({
        where: {
          clientId_therapistId: {
            clientId,
            therapistId
          }
        },
        data: {
          endDate: new Date()
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao remover terapeuta do cliente');
    }
  }

  // Método para encerrar todos os relacionamentos de um cliente
  async endAllTherapistRelationships(clientId: number) {
    try {
      await this.prisma.clientTherapist.updateMany({
        where: {
          clientId,
          endDate: null
        },
        data: {
          endDate: new Date()
        }
      });
    } catch (error) {
      throw new BadRequestException('Erro ao encerrar relacionamentos com terapeutas');
    }
  }

  // Método para encerrar todos os relacionamentos de um terapeuta
  async endAllClientRelationships(therapistId: number) {
    try {
      await this.prisma.clientTherapist.updateMany({
        where: {
          therapistId,
          endDate: null
        },
        data: {
          endDate: new Date()
        }
      });
    } catch (error) {
      throw new BadRequestException('Erro ao encerrar relacionamentos com clientes');
    }
  }

  async getClientTherapists(clientId: number) {
    return await this.prisma.clientTherapist.findMany({
      where: {
        clientId,
        endDate: null // Apenas relacionamentos ativos
      },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true
          }
        }
      },
      orderBy: [
        { isPrimary: 'desc' },
        { startDate: 'asc' }
      ]
    });
  }
}
