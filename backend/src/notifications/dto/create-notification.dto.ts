import { IsEnum, IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsNumber()
  guardianId: number;

  @IsOptional()
  @IsNumber()
  bookingId?: number;

  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsNumber()
  therapistId?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
