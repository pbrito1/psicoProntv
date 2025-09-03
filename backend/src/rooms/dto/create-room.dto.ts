import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Nome da sala' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Capacidade da sala', minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  capacity: number;

  @ApiPropertyOptional({ description: 'Recursos disponíveis na sala' })
  @IsOptional()
  @IsArray()
  resources?: string[];

  @ApiPropertyOptional({ description: 'Horário de abertura (formato HH:MM)' })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ description: 'Horário de fechamento (formato HH:MM)' })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({ description: 'Descrição da sala' })
  @IsOptional()
  @IsString()
  description?: string;
}
