import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min } from 'class-validator';
import { SessionType } from '@prisma/client';
import type { Room } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID da sala' })
  @IsNumber()
  roomId: number;

  @ApiProperty({ description: 'ID do terapeuta' })
  @IsNumber()
  therapistId: number;

  @ApiPropertyOptional({ description: 'ID do cliente (opcional para sessões em grupo)' })
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @ApiProperty({ description: 'Data e hora de início' })
  @IsDateString()
  start: string;

  @ApiProperty({ description: 'Data e hora de fim' })
  @IsDateString()
  end: string;

  @ApiProperty({ description: 'Título do agendamento' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descrição do agendamento' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tipo do agendamento', enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiPropertyOptional({ description: 'Número máximo de participantes (para sessões em grupo)', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: Room['capacity'];
}
