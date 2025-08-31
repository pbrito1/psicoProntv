import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateGuardianDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  cpf: string;

  @IsString()
  relationship: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  canViewRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  canBookSessions?: boolean;

  @IsOptional()
  @IsBoolean()
  canCancelSessions?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewBilling?: boolean;
}
