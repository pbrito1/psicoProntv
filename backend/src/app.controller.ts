import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status da API' })
  @ApiResponse({ status: 200, description: 'API funcionando' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('cleanup')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpar dados antigos do sistema' })
  @ApiResponse({ status: 200, description: 'Limpeza concluída' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async cleanupOldData() {
    return this.appService.cleanupOldData();
  }

  @Get('integrity')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar integridade dos dados' })
  @ApiResponse({ status: 200, description: 'Verificação concluída' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async checkDataIntegrity() {
    return this.appService.checkDataIntegrity();
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas do sistema' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getSystemStats() {
    return this.appService.getSystemStats();
  }
}
