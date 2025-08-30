import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : '';
    return this.prisma.user.create({
      data: { 
        email: input.email, 
        name: input.name ?? null, 
        phone: input.phone ?? null,
        specialty: input.specialty ?? null,
        passwordHash, 
        role: input.role 
      },
      select: { id: true, email: true, name: true, phone: true, specialty: true, role: true, createdAt: true, updatedAt: true },
    });
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
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, name: true },
    });
  }
}


