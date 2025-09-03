import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserDto) {
    try {
      const existing = await this.prisma.user.findUnique({ 
        where: { email: input.email } 
      });
      
      if (existing) {
        throw new ConflictException('E-mail já cadastrado');
      }

      let passwordHash: string | undefined;
      if (input.password) {
        if (input.password.length < 6) {
          throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
        }
        passwordHash = await bcrypt.hash(input.password, 10);
      }

      const { password, ...userData } = input;

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          passwordHash: passwordHash || '',
        },
        select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar usuário');
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async findByEmailWithSensitive(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, passwordHash: true, refreshTokenHash: true, createdAt: true, updatedAt: true },
    });
  }

  async findByIdWithSensitive(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, passwordHash: true, refreshTokenHash: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: number, input: UpdateUserDto) {
    await this.findOne(id);

    if (input.email) {
      const existing = await this.prisma.user.findFirst({
        where: { 
          email: input.email, 
          id: { not: id } 
        }
      });
      if (existing) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    const data: any = {
      name: input.name,
      phone: input.phone,
      specialty: input.specialty
    };
    
    if (input.email) {
      data.email = input.email;
    }
    
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async setRefreshToken(id: number, refreshTokenHash: string) {
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHash } });
  }

  async clearRefreshToken(id: number) {
    await this.prisma.user.update({ where: { id }, data: { refreshTokenHash: null } });
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const activeBookings = await this.prisma.booking.findMany({
        where: {
          therapistId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com agendamentos ativos');
      }

      const medicalRecords = await this.prisma.medicalRecord.findMany({
        where: { therapistId: id }
      });

      if (medicalRecords.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com prontuários médicos');
      }

      const activeClientRelations = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId: id,
          endDate: null
        }
      });

      if (activeClientRelations.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com relacionamentos ativos com clientes');
      }

      const pendingNotifications = await this.prisma.notification.findMany({
        where: {
          therapistId: id,
          isRead: false
        }
      });

      if (pendingNotifications.length > 0) {
        await this.prisma.notification.updateMany({
          where: { therapistId: id },
          data: { isRead: true }
        });
      }

      await this.clearRefreshToken(id);

      return await this.prisma.user.delete({
        where: { id },
        select: { id: true, email: true, name: true },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir usuário');
    }
  }
}


