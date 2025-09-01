import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string | null;
  password?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserDto) {
    try {
      // Verificar se o email já existe
      const existing = await this.prisma.user.findUnique({ 
        where: { email: input.email } 
      });
      
      if (existing) {
        throw new ConflictException('E-mail já cadastrado');
      }

      // Validar senha se fornecida
      if (input.password) {
        if (input.password.length < 6) {
          throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
        }
        
        // Verificar se a senha não é muito simples
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(input.password)) {
          throw new BadRequestException('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
        }
      }

      // Validar telefone se fornecido
      if (input.phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(input.phone.replace(/\D/g, ''))) {
          throw new BadRequestException('Telefone inválido');
        }
      }

      // Validar especialidade se fornecida
      if (input.specialty && input.specialty.trim().length < 3) {
        throw new BadRequestException('Especialidade deve ter pelo menos 3 caracteres');
      }

      // Hash da senha
      const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : '';

      // Criar usuário
      const user = await this.prisma.user.create({
        data: { 
          email: input.email, 
          name: input.name ?? null, 
          phone: input.phone ?? null,
          specialty: input.specialty ?? null,
          passwordHash, 
          role: input.role 
        },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          phone: true, 
          specialty: true, 
          role: true, 
          createdAt: true, 
          updatedAt: true 
        },
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
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithSensitive(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, input: UpdateUserDto) {
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
      // Verificar se o usuário existe
      await this.findOne(id);

      // Verificar se o usuário tem agendamentos ativos
      const activeBookings = await this.prisma.booking.findMany({
        where: {
          therapistId: id,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookings.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com agendamentos ativos');
      }

      // Verificar se o usuário tem prontuários médicos
      const medicalRecords = await this.prisma.medicalRecord.findMany({
        where: { therapistId: id }
      });

      if (medicalRecords.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com prontuários médicos');
      }

      // Verificar se o usuário tem relacionamentos ativos com clientes
      const activeClientRelations = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId: id,
          endDate: null // Relacionamentos ativos
        }
      });

      if (activeClientRelations.length > 0) {
        throw new BadRequestException('Não é possível excluir um usuário com relacionamentos ativos com clientes');
      }

      // Verificar se há notificações pendentes
      const pendingNotifications = await this.prisma.notification.findMany({
        where: {
          therapistId: id,
          isRead: false
        }
      });

      if (pendingNotifications.length > 0) {
        // Marcar notificações como lidas antes de deletar
        await this.prisma.notification.updateMany({
          where: { therapistId: id },
          data: { isRead: true }
        });
      }

      // Limpar token de refresh antes de deletar
      await this.clearRefreshToken(id);

      // Se não houver conflitos, deletar o usuário
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


