import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GuardianAuthService } from './guardian-auth.service';
import { CreateGuardianDto } from '../guardians/dto/create-guardian.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('guardian-auth')
export class GuardianAuthController {
  constructor(private readonly guardianAuthService: GuardianAuthService) {}

  @Post('register')
  async register(@Body() createGuardianDto: CreateGuardianDto) {
    return this.guardianAuthService.register(createGuardianDto);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.guardianAuthService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: { refresh_token: string }) {
    return this.guardianAuthService.refreshToken(refreshDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any) {
    return this.guardianAuthService.logout(req.user.sub);
  }
}
