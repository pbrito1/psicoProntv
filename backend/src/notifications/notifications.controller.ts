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
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Criar notificação (apenas para terapeutas/admin)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createGeneralNotification(
      createNotificationDto.guardianId,
      createNotificationDto.title,
      createNotificationDto.message,
      createNotificationDto.priority,
      createNotificationDto.metadata,
    );
  }

  // Buscar notificações do guardião logado
  @Get('guardian/me')
  findGuardianNotifications(
    @Request() req: any,
    @Query('includeRead') includeRead?: string,
  ) {
    const guardianId = req.user.sub;
    return this.notificationsService.findGuardianNotifications(
      guardianId,
      includeRead === 'true',
    );
  }

  // Marcar notificação como lida
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  // Marcar todas as notificações como lidas
  @Patch('guardian/me/read-all')
  markAllAsRead(@Request() req: any) {
    const guardianId = req.user.sub;
    return this.notificationsService.markAllAsRead(guardianId);
  }

  // Buscar notificação por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  // Atualizar notificação
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  // Deletar notificação
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
