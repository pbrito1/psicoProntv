import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateParentAccountsDto {
  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsEmail()
  motherEmail?: string;

  @IsOptional()
  @IsString()
  motherPhone?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsEmail()
  fatherEmail?: string;

  @IsOptional()
  @IsString()
  fatherPhone?: string;
}

export class ParentAccountResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  username: string;
  password: string;
  createdAt: Date;
}

export class CreateParentAccountsResponseDto {
  clientId: number;
  generatedAccounts: ParentAccountResponseDto[];
  message: string;
}
