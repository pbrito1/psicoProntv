import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TherapistAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role !== 'THERAPIST') {
      throw new ForbiddenException('Apenas terapeutas podem acessar estes dados');
    }

    const therapistId = user.userId || user.sub;
    if (!therapistId) {
      throw new ForbiddenException('ID do terapeuta não encontrado');
    }

    const clientId = this.extractClientId(request);
    if (clientId) {
      const hasAccess = await this.verifyTherapistAccess(Number(therapistId), Number(clientId));
      if (!hasAccess) {
        throw new ForbiddenException('Terapeuta não tem acesso a este cliente');
      }
    }

    return true;
  }

  private extractClientId(request: any): number | null {
    if (request.params.clientId) {
      return Number(request.params.clientId);
    }
    
    if (request.params.id && request.route.path.includes('clients')) {
      return Number(request.params.id);
    }
    
    if (request.body.clientId) {
      return Number(request.body.clientId);
    }
    
    if (request.query.clientId) {
      return Number(request.query.clientId);
    }

    return null;
  }

  private async verifyTherapistAccess(therapistId: number, clientId: number): Promise<boolean> {
    const hasBookings = await this.prisma.booking.findFirst({
      where: {
        therapistId,
        clientId,
      },
    });

    const hasMedicalRecords = await this.prisma.medicalRecord.findFirst({
      where: {
        therapistId,
        clientId,
      },
    });

    return !!(hasBookings || hasMedicalRecords);
  }
}
