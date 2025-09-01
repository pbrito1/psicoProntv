import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService) {}

  async create(createGuardianDto: CreateGuardianDto) {
    try {
      // Verificar se o email já existe
      const existingEmail = await this.prisma.guardian.findUnique({
        where: { email: createGuardianDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }

      // Verificar se o CPF já existe
      const existingCPF = await this.prisma.guardian.findUnique({
        where: { cpf: createGuardianDto.cpf }
      });

      if (existingCPF) {
        throw new ConflictException('CPF já cadastrado');
      }

      // Validar CPF
      if (!this.isValidCPF(createGuardianDto.cpf)) {
        throw new BadRequestException('CPF inválido');
      }

      // Validar senha
      if (createGuardianDto.password.length < 6) {
        throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
      }

      // Verificar se a senha não é muito simples
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(createGuardianDto.password)) {
        throw new BadRequestException('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
      }

      // Validar telefone
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(createGuardianDto.phone.replace(/\D/g, ''))) {
        throw new BadRequestException('Telefone inválido');
      }

      // Validar relacionamento
      const validRelationships = ['Pai', 'Mãe', 'Avó', 'Avô', 'Tio', 'Tia', 'Responsável Legal', 'Outro'];
      if (!validRelationships.includes(createGuardianDto.relationship)) {
        throw new BadRequestException('Relacionamento inválido');
      }

      const { password, ...guardianData } = createGuardianDto;
      const passwordHash = await bcrypt.hash(password, 10);
      
      return await this.prisma.guardian.create({
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
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar guardião');
    }
  }

  // Método auxiliar para validar CPF
  private isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  async findAll() {
    return this.prisma.guardian.findMany({
      where: { isActive: true },
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

  async update(
    id: number, 
    updateGuardianDto: UpdateGuardianDto
  ) {
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
    try {
      // Verificar se o guardião existe
      await this.findOne(id);

      // Verificar se o guardião tem clientes ativos
      const activeClients = await this.prisma.client.findMany({
        where: {
          guardians: {
            some: {
              id,
              isActive: true
            }
          }
        }
      });

      if (activeClients.length > 0) {
        throw new BadRequestException('Não é possível desativar um guardião com clientes ativos');
      }

      // Verificar se há notificações não lidas
      const unreadNotifications = await this.prisma.notification.findMany({
        where: {
          guardianId: id,
          isRead: false
        }
      });

      if (unreadNotifications.length > 0) {
        // Marcar notificações como lidas antes de desativar
        await this.prisma.notification.updateMany({
          where: { guardianId: id },
          data: { isRead: true }
        });
      }

      // Soft delete - marcar como inativo
      return await this.prisma.guardian.update({
        where: { id },
        data: { 
          isActive: false,
          refreshTokenHash: null // Limpar token de refresh
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao desativar guardião');
    }
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

  async bookSession(childId: number, bookingData: any) {
    // Implementar lógica de agendamento
    return this.prisma.booking.create({
      data: {
        ...bookingData,
        clientId: childId,
      },
      include: {
        room: true,
        therapist: true,
        client: true,
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
