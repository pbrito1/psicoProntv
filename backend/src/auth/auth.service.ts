import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async signTokens(user: { id: number; email: string; role?: string }) {
    const accessPayload = { sub: user.id, email: user.email, role: user.role ?? 'THERAPIST' };
    const refreshPayload = { sub: user.id };
    const access_token = await this.jwtService.signAsync(accessPayload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
    const refresh_token = await this.jwtService.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'dev-secret') + '-refresh',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });
    return { access_token, refresh_token };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.signTokens(user);
    // store refresh token hash
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.setRefreshToken(user.id, refreshTokenHash);
    return { ...tokens, user };
  }

  async register(dto: CreateUserDto) {
    const created = await this.usersService.create(dto);
    const tokens = await this.signTokens(created);
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.setRefreshToken(created.id, refreshTokenHash);
    return { ...tokens, user: created };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<{ sub: number }>(refreshToken, {
      secret:
        process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'dev-secret') + '-refresh',
    });
    const userId = payload.sub;
    const user = await this.usersService.findByIdWithSensitive(userId);
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Sem refresh token');
    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token inválido');
    const tokens = await this.signTokens({ id: user.id, email: user.email, role: user.role });
    const refreshTokenHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.setRefreshToken(user.id, refreshTokenHash);
    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
    return { success: true };
  }
}
