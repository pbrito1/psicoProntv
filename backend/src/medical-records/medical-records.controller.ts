import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Query, 
  UseGuards,
  Request
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TherapistAccessGuard } from '../guards/therapist-access.guard';
import { MedicalRecordAccessGuard } from '../guards/medical-record-access.guard';

@ApiTags('medical-records')
@ApiBearerAuth()
@Controller('medical-records')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles('ADMIN', 'THERAPIST')
  @ApiOperation({ summary: 'Criar um novo prontuário médico' })
  @ApiResponse({ status: 201, description: 'Prontuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflitos' })
  create(@Body() dto: CreateMedicalRecordDto, @Request() req: any) {
    // Se não for fornecido therapistId, usar o usuário logado
    if (!dto.therapistId) {
      dto.therapistId = req.user.id;
    }
    return this.medicalRecordsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os prontuários' })
  @ApiResponse({ status: 200, description: 'Lista de prontuários retornada com sucesso' })
  findAll(@Request() req: any) {
    // Se for terapeuta, filtrar apenas seus prontuários
    if (req.user.role === 'THERAPIST') {
      const therapistId = req.user.userId || req.user.sub;
      return this.medicalRecordsService.findByTherapist(therapistId);
    }
    // Se for admin, retornar todos
    return this.medicalRecordsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar prontuários por conteúdo' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  search(@Query('q') query: string) {
    return this.medicalRecordsService.search(query);
  }

  @Get('client/:clientId')
  @UseGuards(TherapistAccessGuard)
  @ApiOperation({ summary: 'Buscar prontuários de um cliente específico' })
  @ApiResponse({ status: 200, description: 'Prontuários do cliente retornados com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findByClient(@Param('clientId') clientId: string) {
    return this.medicalRecordsService.findByClient(Number(clientId));
  }

  @Get('therapist/:therapistId')
  @ApiOperation({ summary: 'Buscar prontuários de um terapeuta específico' })
  @ApiResponse({ status: 200, description: 'Prontuários do terapeuta retornados com sucesso' })
  findByTherapist(@Param('therapistId') therapistId: string) {
    return this.medicalRecordsService.findByTherapist(Number(therapistId));
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Buscar prontuário por agendamento' })
  @ApiResponse({ status: 200, description: 'Prontuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.medicalRecordsService.findByBooking(Number(bookingId));
  }

  @Get('client/:clientId/progress')
  @UseGuards(TherapistAccessGuard)
  @ApiOperation({ summary: 'Obter progresso do cliente' })
  @ApiResponse({ status: 200, description: 'Progresso retornado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  getClientProgress(@Param('clientId') clientId: string) {
    return this.medicalRecordsService.getClientProgress(Number(clientId));
  }

  @Get('therapist/:therapistId/stats')
  @ApiOperation({ summary: 'Obter estatísticas do terapeuta' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  getTherapistStats(@Param('therapistId') therapistId: string) {
    return this.medicalRecordsService.getTherapistStats(Number(therapistId));
  }

  @Get(':id')
  @UseGuards(MedicalRecordAccessGuard)
  @ApiOperation({ summary: 'Buscar prontuário por ID' })
  @ApiResponse({ status: 200, description: 'Prontuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(Number(id));
  }

  @Patch(':id')
  @UseGuards(MedicalRecordAccessGuard)
  @Roles('ADMIN', 'THERAPIST')
  @ApiOperation({ summary: 'Atualizar prontuário' })
  @ApiResponse({ status: 200, description: 'Prontuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflitos' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Excluir prontuário' })
  @ApiResponse({ status: 200, description: 'Prontuário excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Prontuário não encontrado' })
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(Number(id));
  }
}
