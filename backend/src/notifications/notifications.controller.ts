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

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('guardian/me/read-all')
  markAllAsRead(@Request() req: any) {
    const guardianId = req.user.sub;
    return this.notificationsService.markAllAsRead(guardianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
