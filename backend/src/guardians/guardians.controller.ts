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
  ParseIntPipe 
} from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuardianChildGuard } from '../guards/guardian-child.guard';

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

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
}
