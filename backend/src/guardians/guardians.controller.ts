import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { GuardianAccountService } from './guardian-account.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { CreateParentAccountsDto, CreateParentAccountsResponseDto } from './dto/create-parent-accounts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GuardianChildGuard } from '../guards/guardian-child.guard';

@ApiTags('Guardians')
@Controller('guardians')
export class GuardiansController {
  constructor(
    private readonly guardiansService: GuardiansService,
    private readonly guardianAccountService: GuardianAccountService
  ) {}

  @Post()
  create(@Body() createGuardianDto: CreateGuardianDto) {
    return this.guardiansService.create(createGuardianDto);
  }

  @Get()
  findAll() {
    return this.guardiansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guardiansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGuardianDto: UpdateGuardianDto
  ) {
    return this.guardiansService.update(id, updateGuardianDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guardiansService.remove(id);
  }

  // Rotas específicas para pais logados
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getProfile(@Request() req: any) {
    return this.guardiansService.getGuardianProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('children/me')
  async getChildren(@Request() req: any) {
    return this.guardiansService.getGuardianChildren(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, GuardianChildGuard)
  @Get('children/:childId/sessions')
  async getChildSessions(
    @Request() req: any, 
    @Param('childId', ParseIntPipe) childId: number
  ) {
    return this.guardiansService.getChildSessions(childId);
  }

  @UseGuards(JwtAuthGuard, GuardianChildGuard)
  @Post('children/:childId/book-session')
  async bookSession(
    @Request() req: any,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() bookingData: any,
  ) {
    return this.guardiansService.bookSession(childId, bookingData);
  }

  @UseGuards(JwtAuthGuard, GuardianChildGuard)
  @Get('children/:childId/medical-records')
  async getChildMedicalRecords(
    @Request() req: any, 
    @Param('childId', ParseIntPipe) childId: number
  ) {
    return this.guardiansService.getChildMedicalRecords(childId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-child/:childId')
  async linkChildToGuardian(
    @Request() req: any,
    @Param('childId', ParseIntPipe) childId: number,
  ) {
    return this.guardiansService.linkChildToGuardian(req.user.sub, childId);
  }

  // ===== ROTAS PARA GERAÇÃO DE CONTAS DE PAIS =====
  
  @Post('generate-parent-accounts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'THERAPIST')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Gera contas de pais para um cliente',
    description: 'Cria automaticamente contas de acesso para os pais de um cliente no GuardianPortal'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Contas de pais criadas com sucesso',
    type: CreateParentAccountsResponseDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async generateParentAccounts(
    @Body() createParentAccountsDto: CreateParentAccountsDto
  ): Promise<CreateParentAccountsResponseDto> {
    try {
      // Validar se pelo menos um pai foi fornecido
      if (!createParentAccountsDto.motherName && !createParentAccountsDto.fatherName) {
        throw new BadRequestException('Pelo menos um pai deve ser fornecido');
      }

      // Validar se os dados da mãe estão completos (se fornecidos)
      if (createParentAccountsDto.motherName && !createParentAccountsDto.motherEmail) {
        throw new BadRequestException('Email da mãe é obrigatório quando o nome é fornecido');
      }

      // Validar se os dados do pai estão completos (se fornecidos)
      if (createParentAccountsDto.fatherName && !createParentAccountsDto.fatherEmail) {
        throw new BadRequestException('Email do pai é obrigatório quando o nome é fornecido');
      }

      const generatedAccounts = await this.guardianAccountService.generateParentAccountsForClient(
        createParentAccountsDto.clientId,
        createParentAccountsDto.motherName ? {
          name: createParentAccountsDto.motherName,
          email: createParentAccountsDto.motherEmail!,
          phone: createParentAccountsDto.motherPhone || '',
        } : undefined,
        createParentAccountsDto.fatherName ? {
          name: createParentAccountsDto.fatherName,
          email: createParentAccountsDto.fatherEmail!,
          phone: createParentAccountsDto.fatherPhone || '',
        } : undefined,
      );

      const response: CreateParentAccountsResponseDto = {
        clientId: createParentAccountsDto.clientId,
        generatedAccounts: generatedAccounts.map(account => ({
          id: account.guardian.id,
          name: account.guardian.name,
          email: account.guardian.email,
          phone: account.guardian.phone,
          relationship: account.guardian.relationship,
          username: account.credentials.username,
          password: account.credentials.password,
          createdAt: account.guardian.createdAt,
        })),
        message: `Contas criadas com sucesso para ${generatedAccounts.length} pai(s)/responsável(is)`,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('client/:clientId/guardians')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'THERAPIST')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Lista os pais de um cliente',
    description: 'Retorna todas as contas de pais vinculadas a um cliente específico'
  })
  @ApiResponse({ status: 200, description: 'Lista de pais retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async getClientGuardians(
    @Param('clientId', ParseIntPipe) clientId: number
  ) {
    return this.guardianAccountService.getClientGuardians(clientId);
  }

  @Delete('client/:clientId/guardian/:guardianId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'THERAPIST')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remove vinculação de um pai com um cliente',
    description: 'Desvincula um pai de um cliente específico (não remove a conta do pai)'
  })
  @ApiResponse({ status: 200, description: 'Vinculação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente ou pai não encontrado' })
  async unlinkGuardianFromClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('guardianId', ParseIntPipe) guardianId: number
  ) {
    await this.guardianAccountService.unlinkGuardianFromClient(guardianId, clientId);
    return { 
      message: 'Vinculação removida com sucesso',
      clientId,
      guardianId
    };
  }

  @Post('update-cpf/:guardianId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'THERAPIST')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Atualiza CPF de um pai',
    description: 'Atualiza o CPF temporário de um pai com o CPF real'
  })
  @ApiResponse({ status: 200, description: 'CPF atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'CPF inválido' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado' })
  async updateGuardianCPF(
    @Param('guardianId', ParseIntPipe) guardianId: number,
    @Body() body: { cpf: string }
  ) {
    if (!body.cpf) {
      throw new BadRequestException('CPF é obrigatório');
    }

    await this.guardianAccountService.updateGuardianCPF(guardianId, body.cpf);
    return { 
      message: 'CPF atualizado com sucesso',
      guardianId,
      cpf: body.cpf
    };
  }
}
