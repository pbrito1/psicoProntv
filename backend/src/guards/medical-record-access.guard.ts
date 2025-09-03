import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role !== 'THERAPIST') {
      throw new ForbiddenException('Apenas terapeutas podem acessar prontuários médicos');
    }

    const therapistId = user.userId || user.sub;
    if (!therapistId) {
      throw new ForbiddenException('ID do terapeuta não encontrado');
    }

    const recordId = this.extractRecordId(request);
    if (recordId) {
      const hasAccess = await this.verifyRecordAccess(Number(therapistId), Number(recordId));
      if (!hasAccess) {
        throw new ForbiddenException('Terapeuta não tem acesso a este prontuário');
      }
    }

    return true;
  }

  private extractRecordId(request: any): number | null {
    if (request.params.id && request.route.path.includes('medical-records')) {
      return Number(request.params.id);
    }
    
    if (request.params.recordId) {
      return Number(request.params.recordId);
    }

    return null;
  }

  private async verifyRecordAccess(therapistId: number, recordId: number): Promise<boolean> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: recordId },
      select: { therapistId: true }
    });

    if (!record) {
      throw new ForbiddenException('Prontuário não encontrado');
    }

    return record.therapistId === therapistId;
  }
}
