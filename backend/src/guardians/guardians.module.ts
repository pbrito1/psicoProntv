import { Module } from '@nestjs/common';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { GuardianAccountService } from './guardian-account.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GuardiansController],
  providers: [GuardiansService, GuardianAccountService],
  exports: [GuardiansService, GuardianAccountService],
})
export class GuardiansModule {}
