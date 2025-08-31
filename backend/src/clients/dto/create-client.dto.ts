import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ description: 'Nome completo do cliente' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Email do cliente' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Data de nascimento do cliente' })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({ description: 'Endereço do cliente' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ description: 'Contato de emergência' })
  @IsString()
  @IsNotEmpty()
  emergencyContact!: string;

  @ApiProperty({ description: 'Telefone de emergência' })
  @IsString()
  @IsNotEmpty()
  emergencyPhone!: string;

  @ApiProperty({ description: 'Histórico médico', required: false })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({ description: 'Medicamentos atuais', required: false })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiProperty({ description: 'Alergias', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;
}
