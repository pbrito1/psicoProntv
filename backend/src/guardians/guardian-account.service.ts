import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import * as bcrypt from 'bcryptjs';

export interface GuardianAccountData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  password: string;
  username: string;
}

export interface GeneratedGuardianAccount {
  guardian: any;
  credentials: {
    username: string;
    password: string;
    email: string;
  };
}

@Injectable()
export class GuardianAccountService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera credenciais de acesso para um pai/responsável
   */
  async generateGuardianAccount(guardianData: GuardianAccountData): Promise<GeneratedGuardianAccount> {
    try {
      // Verificar se o email já existe
      const existingEmail = await this.prisma.guardian.findUnique({
        where: { email: guardianData.email }
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }

      // Gerar CPF temporário (será atualizado posteriormente)
      const tempCPF = this.generateTempCPF();

      // Criar DTO para o guardião
      const createGuardianDto: CreateGuardianDto = {
        name: guardianData.name,
        email: guardianData.email,
        phone: guardianData.phone,
        cpf: tempCPF,
        relationship: guardianData.relationship,
        password: guardianData.password,
        isPrimary: false,
        canViewRecords: true,
        canBookSessions: false,
        canCancelSessions: false,
        canViewBilling: false,
      };

      // Criar o guardião
      const { password, ...guardianDataWithoutPassword } = createGuardianDto;
      const passwordHash = await bcrypt.hash(password, 10);

      const guardian = await this.prisma.guardian.create({
        data: {
          ...guardianDataWithoutPassword,
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

      return {
        guardian,
        credentials: {
          username: guardianData.username,
          password: guardianData.password,
          email: guardianData.email,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar conta do guardião');
    }
  }

  /**
   * Gera múltiplas contas de pais para um cliente
   */
  async generateParentAccountsForClient(
    clientId: number,
    motherData?: { name: string; email: string; phone: string },
    fatherData?: { name: string; email: string; phone: string }
  ): Promise<GeneratedGuardianAccount[]> {
    const generatedAccounts: GeneratedGuardianAccount[] = [];

    try {
      // Gerar conta para a mãe
      if (motherData && motherData.name && motherData.email) {
        const motherPassword = this.generateSecurePassword();
        const motherUsername = this.generateUsername(motherData.name, 'mae');

        const motherAccount = await this.generateGuardianAccount({
          name: motherData.name,
          email: motherData.email,
          phone: motherData.phone || '',
          relationship: 'Mãe',
          password: motherPassword,
          username: motherUsername,
        });

        // Vincular ao cliente
        await this.linkGuardianToClient(motherAccount.guardian.id, clientId);

        generatedAccounts.push(motherAccount);
      }

      // Gerar conta para o pai
      if (fatherData && fatherData.name && fatherData.email) {
        const fatherPassword = this.generateSecurePassword();
        const fatherUsername = this.generateUsername(fatherData.name, 'pai');

        const fatherAccount = await this.generateGuardianAccount({
          name: fatherData.name,
          email: fatherData.email,
          phone: fatherData.phone || '',
          relationship: 'Pai',
          password: fatherPassword,
          username: fatherUsername,
        });

        // Vincular ao cliente
        await this.linkGuardianToClient(fatherAccount.guardian.id, clientId);

        generatedAccounts.push(fatherAccount);
      }

      return generatedAccounts;
    } catch (error) {
      // Se houver erro, tentar limpar as contas criadas
      for (const account of generatedAccounts) {
        try {
          await this.prisma.guardian.delete({
            where: { id: account.guardian.id }
          });
        } catch (cleanupError) {
          console.error('Erro ao limpar conta durante rollback:', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Vincula um guardião a um cliente
   */
  private async linkGuardianToClient(guardianId: number, clientId: number): Promise<void> {
    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: {
        clients: {
          connect: { id: clientId },
        },
      },
    });
  }

  /**
   * Gera um nome de usuário baseado no nome e tipo de responsável
   */
  private generateUsername(name: string, type: string): string {
    const cleanName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '.') // Substitui espaços por pontos
      .trim();

    return `${cleanName}.${type}`;
  }

  /**
   * Gera uma senha segura
   */
  private generateSecurePassword(): string {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Gera um CPF temporário para criação inicial
   * Será atualizado posteriormente com o CPF real
   */
  private generateTempCPF(): string {
    // Gera um CPF válido temporário
    const digits = [];
    
    // Primeiros 9 dígitos aleatórios
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    digits.push(remainder);
    
    return digits.join('');
  }

  /**
   * Atualiza o CPF de um guardião (quando o CPF real for fornecido)
   */
  async updateGuardianCPF(guardianId: number, realCPF: string): Promise<void> {
    // Verificar se o CPF já existe
    const existingCPF = await this.prisma.guardian.findUnique({
      where: { cpf: realCPF }
    });

    if (existingCPF && existingCPF.id !== guardianId) {
      throw new ConflictException('CPF já cadastrado para outro guardião');
    }

    // Validar CPF
    if (!this.isValidCPF(realCPF)) {
      throw new BadRequestException('CPF inválido');
    }

    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: { cpf: realCPF }
    });
  }

  /**
   * Valida CPF
   */
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

  /**
   * Busca contas de pais de um cliente
   */
  async getClientGuardians(clientId: number): Promise<any[]> {
    return this.prisma.guardian.findMany({
      where: {
        clients: {
          some: { id: clientId }
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        relationship: true,
        isPrimary: true,
        createdAt: true,
      }
    });
  }

  /**
   * Remove a vinculação de um guardião com um cliente
   */
  async unlinkGuardianFromClient(guardianId: number, clientId: number): Promise<void> {
    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: {
        clients: {
          disconnect: { id: clientId }
        }
      }
    });
  }
}
