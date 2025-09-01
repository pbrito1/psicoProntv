import { Body, Controller, Post, Req, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GuardianAuthService } from './guardian-auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateGuardianDto } from '../guardians/dto/create-guardian.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly guardianAuthService: GuardianAuthService
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(Number(req.user.userId));
  }

  // ===== ROTAS PARA AUTENTICAÇÃO DE GUARDIANS =====
  
  @Post('guardian/register')
  @ApiOperation({ summary: 'Registro de pai/responsável' })
  @ApiResponse({ status: 201, description: 'Pai registrado com sucesso' })
  async registerGuardian(@Body() createGuardianDto: CreateGuardianDto) {
    return this.guardianAuthService.register(createGuardianDto);
  }

  @Post('guardian/login')
  @ApiOperation({ summary: 'Login de pai/responsável' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  async loginGuardian(@Body() loginDto: { email: string; password: string }) {
    return this.guardianAuthService.login(loginDto.email, loginDto.password);
  }

  @Post('guardian/refresh')
  @ApiOperation({ summary: 'Renovar token de pai/responsável' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  async refreshGuardianToken(@Body() refreshDto: { refresh_token: string }) {
    return this.guardianAuthService.refreshToken(refreshDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('guardian/logout')
  @ApiOperation({ summary: 'Logout de pai/responsável' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logoutGuardian(@Request() req: any) {
    return this.guardianAuthService.logout(req.user.sub);
  }
}
