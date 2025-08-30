import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN'
}

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.THERAPIST })
  @IsEnum(UserRole)
  role: UserRole = UserRole.THERAPIST;

  @ApiProperty({ minLength: 6, required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}


