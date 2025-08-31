import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuardianChildGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const guardianId = request.user.sub;
    const childId = parseInt(request.params.childId);

    if (!guardianId || !childId) {
      throw new ForbiddenException('Dados de acesso inválidos');
    }

    const hasAccess = await this.prisma.guardian.findFirst({
      where: {
        id: guardianId,
        clients: { some: { id: childId } },
        isActive: true,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Acesso negado a este cliente');
    }

    return true;
  }
}
