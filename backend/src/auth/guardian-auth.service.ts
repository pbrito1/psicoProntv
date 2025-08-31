import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateGuardianDto } from '../guardians/dto/create-guardian.dto';

@Injectable()
export class GuardianAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createGuardianDto: CreateGuardianDto) {
    // Verificar se o email já existe
    const existingGuardian = await this.prisma.guardian.findUnique({
      where: { email: createGuardianDto.email },
    });

    if (existingGuardian) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se o CPF já existe
    const existingCPF = await this.prisma.guardian.findUnique({
      where: { cpf: createGuardianDto.cpf },
    });

    if (existingCPF) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(createGuardianDto.password, 10);

    // Criar o guardião
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

    // Gerar tokens
    const payload = {
      sub: guardian.id,
      email: guardian.email,
      role: 'GUARDIAN',
      clientIds: guardian.clients?.map(c => c.id) || [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Salvar o refresh token
    await this.prisma.guardian.update({
      where: { id: guardian.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      guardian: {
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        relationship: guardian.relationship,
        clients: guardian.clients || [],
      },
    };
  }

  async validateGuardian(email: string, password: string) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { email },
      include: { clients: true },
    });

    if (!guardian || !guardian.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, guardian.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return guardian;
  }

  async login(email: string, password: string) {
    const guardian = await this.validateGuardian(email, password);
    
    const payload = {
      sub: guardian.id,
      email: guardian.email,
      role: 'GUARDIAN',
      clientIds: guardian.clients?.map(c => c.id) || [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Atualizar o refresh token
    await this.prisma.guardian.update({
      where: { id: guardian.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      guardian: {
        id: guardian.id,
        name: guardian.name,
        email: guardian.email,
        relationship: guardian.relationship,
        clients: guardian.clients || [],
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const guardian = await this.prisma.guardian.findUnique({
        where: { id: payload.sub },
        include: { clients: true },
      });

      if (!guardian || !guardian.isActive) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar se o refresh token ainda é válido
      if (!guardian.refreshTokenHash) {
        throw new UnauthorizedException('Token expirado');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, guardian.refreshTokenHash);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Token expirado');
      }

      // Gerar novos tokens
      const newPayload = {
        sub: guardian.id,
        email: guardian.email,
        role: 'GUARDIAN',
        clientIds: guardian.clients?.map(c => c.id) || [],
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Atualizar o refresh token
      await this.prisma.guardian.update({
        where: { id: guardian.id },
        data: { refreshTokenHash: await bcrypt.hash(newRefreshToken, 10) },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(guardianId: number) {
    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: { refreshTokenHash: null },
    });

    return { message: 'Logout realizado com sucesso' };
  }
}
