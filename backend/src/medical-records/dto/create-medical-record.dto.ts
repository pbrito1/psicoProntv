import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  FAMILY = 'FAMILY'
}

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @ApiProperty({ description: 'ID do terapeuta' })
  @IsNumber()
  @IsNotEmpty()
  therapistId!: number;

  @ApiProperty({ description: 'Data da sessão' })
  @IsDateString()
  sessionDate!: string;

  @ApiProperty({ enum: SessionType, description: 'Tipo de sessão', default: SessionType.INDIVIDUAL })
  @IsEnum(SessionType)
  sessionType: SessionType = SessionType.INDIVIDUAL;

  @ApiProperty({ description: 'Duração da sessão em minutos' })
  @IsNumber()
  @IsNotEmpty()
  sessionDuration!: number;

  @ApiProperty({ description: 'Queixa principal (Subjetivo)' })
  @IsString()
  @IsNotEmpty()
  subjective!: string;

  @ApiProperty({ description: 'Observações objetivas' })
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @ApiProperty({ description: 'Avaliação' })
  @IsString()
  @IsNotEmpty()
  assessment!: string;

  @ApiProperty({ description: 'Plano terapêutico' })
  @IsString()
  @IsNotEmpty()
  plan!: string;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Data da próxima sessão', required: false })
  @IsOptional()
  @IsDateString()
  nextSessionDate?: string;

  @ApiProperty({ description: 'ID do agendamento relacionado', required: false })
  @IsOptional()
  @IsNumber()
  bookingId?: number;
}
