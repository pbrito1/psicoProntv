import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CacheMedium, CacheShort, InvalidateClientCache } from '../cache/cache.decorators';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('ADMIN', 'THERAPIST')
  @InvalidateClientCache()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  @CacheMedium('clients:all')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get('search')
  @CacheMedium('clients:search')
  @ApiOperation({ summary: 'Buscar clientes por nome, email ou telefone' })
  @ApiResponse({ status: 200, description: 'Resultados da busca retornados com sucesso' })
  search(@Query('q') query: string) {
    return this.clientsService.search(query);
  }

  @Get(':id')
  @CacheMedium('clients:details')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }

  @Get(':id/stats')
  @CacheShort('clients:stats')
  @ApiOperation({ summary: 'Obter estatísticas do cliente' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  getClientStats(@Param('id') id: string) {
    return this.clientsService.getClientStats(Number(id));
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar cliente por email' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findByEmail(@Param('email') email: string) {
    return this.clientsService.findByEmail(email);
  }

  @Patch(':id')
  @Roles('ADMIN', 'THERAPIST')
  @InvalidateClientCache()
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
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
}
