import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TherapistAccessGuard } from '../guards/therapist-access.guard';
import { CacheMedium, CacheShort, InvalidateClientCache } from '../cache/cache.decorators';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('ADMIN', 'THERAPIST')
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @CacheMedium('clients:all')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  findAll(@Request() req: any) {
    if (req.user.role === 'THERAPIST') {
      const therapistId = req.user.userId || req.user.sub;
      return this.clientsService.findAll(therapistId);
    }
    return this.clientsService.findAll();
  }



  @Get(':id')
  @UseGuards(TherapistAccessGuard)
  @CacheMedium('clients:details')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }





  @Patch(':id')
  @UseGuards(TherapistAccessGuard)
  @Roles('ADMIN', 'THERAPIST')
  @InvalidateClientCache()
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @InvalidateClientCache()
  @ApiOperation({ summary: 'Excluir cliente' })
  @ApiResponse({ status: 200, description: 'Cliente excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Não é possível excluir cliente com agendamentos ativos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(Number(id));
  }





  @Get(':id/therapists')
  @ApiOperation({ summary: 'Listar terapeutas do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de terapeutas retornada com sucesso' })
  getClientTherapists(@Param('id') clientId: string) {
    return this.clientsService.getClientTherapists(Number(clientId));
  }


}
