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
      const existingEmail = await this.prisma.guardian.findUnique({
        where: { email: createGuardianDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }

      const existingCPF = await this.prisma.guardian.findUnique({
        where: { cpf: createGuardianDto.cpf }
      });

      if (existingCPF) {
        throw new ConflictException('CPF já cadastrado');
      }

      const passwordHash = await bcrypt.hash(createGuardianDto.password, 10);

      const { password, ...guardianData } = createGuardianDto;
      const guardian = await this.prisma.guardian.create({
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

      return guardian;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar guardião');
    }
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

  async update(id: number, updateGuardianDto: UpdateGuardianDto) {
    try {
      await this.findOne(id);

      if (updateGuardianDto.email) {
        const existingEmail = await this.prisma.guardian.findFirst({
          where: {
            email: updateGuardianDto.email,
            id: { not: id }
          }
        });

        if (existingEmail) {
          throw new ConflictException('Email já cadastrado');
        }
      }

      if (updateGuardianDto.cpf) {
        const existingCPF = await this.prisma.guardian.findFirst({
          where: {
            cpf: updateGuardianDto.cpf,
            id: { not: id }
          }
        });

        if (existingCPF) {
          throw new ConflictException('CPF já cadastrado');
        }
      }

      let data: any = { ...updateGuardianDto };

      if (updateGuardianDto.password) {
        data.passwordHash = await bcrypt.hash(updateGuardianDto.password, 10);
        delete data.password;
      }

      return await this.prisma.guardian.update({
        where: { id },
        data,
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
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar guardião');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

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

      const unreadNotifications = await this.prisma.notification.findMany({
        where: {
          guardianId: id,
          isRead: false
        }
      });

      if (unreadNotifications.length > 0) {
        await this.prisma.notification.updateMany({
          where: { guardianId: id },
          data: { isRead: true }
        });
      }

      return await this.prisma.guardian.update({
        where: { id },
        data: { 
          isActive: false,
          refreshTokenHash: null
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

  async getGuardianChildSessions(guardianId: number, childId: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      include: {
        clients: {
          where: { id: childId },
          include: {
            bookings: {
              where: {
                start: {
                  gte: new Date(),
                },
              },
              orderBy: {
                start: 'asc',
              },
              include: {
                therapist: true,
                room: true,
              },
            },
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    const child = guardian.clients[0];
    if (!child) {
      throw new ForbiddenException('Acesso negado a este cliente');
    }

    return child.bookings;
  }

  async getGuardianChildMedicalRecords(guardianId: number, childId: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      include: {
        clients: {
          where: { id: childId },
          include: {
            medicalRecords: {
              orderBy: {
                sessionDate: 'desc',
              },
              include: {
                therapist: true,
              },
            },
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    const child = guardian.clients[0];
    if (!child) {
      throw new ForbiddenException('Acesso negado a este cliente');
    }

    return child.medicalRecords;
  }

  async addChildToGuardian(guardianId: number, childId: number) {
    const child = await this.prisma.client.findUnique({
      where: { id: childId }
    });

    if (!child) {
      throw new NotFoundException('Criança não encontrada');
    }

    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId }
    });

    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    const existingRelation = await this.prisma.guardian.findFirst({
      where: {
        id: guardianId,
        clients: {
          some: { id: childId }
        }
      }
    });

    if (existingRelation) {
      throw new ConflictException('Esta criança já está vinculada a este guardião');
    }

    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: {
        clients: {
          connect: { id: childId }
        }
      }
    });

    return { message: 'Criança vinculada ao guardião com sucesso' };
  }

  async removeChildFromGuardian(guardianId: number, childId: number) {
    const relation = await this.prisma.guardian.findFirst({
      where: {
        id: guardianId,
        clients: {
          some: { id: childId }
        }
      }
    });

    if (!relation) {
      throw new NotFoundException('Relacionamento não encontrado');
    }

    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: {
        clients: {
          disconnect: { id: childId }
        }
      }
    });

    return { message: 'Criança removida do guardião com sucesso' };
  }
}
