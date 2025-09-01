import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Se for admin, permite acesso
    if (user.role === 'ADMIN') {
      return true;
    }

    // Se não for terapeuta, nega acesso
    if (user.role !== 'THERAPIST') {
      throw new ForbiddenException('Apenas terapeutas podem acessar agendamentos');
    }

    const therapistId = user.userId || user.sub;
    if (!therapistId) {
      throw new ForbiddenException('ID do terapeuta não encontrado');
    }

    // Verificar se o terapeuta tem acesso ao agendamento
    const bookingId = this.extractBookingId(request);
    if (bookingId) {
      const hasAccess = await this.verifyBookingAccess(Number(therapistId), Number(bookingId));
      if (!hasAccess) {
        throw new ForbiddenException('Terapeuta não tem acesso a este agendamento');
      }
    }

    return true;
  }

  private extractBookingId(request: any): number | null {
    if (request.params.id && request.route.path.includes('bookings')) {
      return Number(request.params.id);
    }
    
    if (request.params.bookingId) {
      return Number(request.params.bookingId);
    }

    return null;
  }

  private async verifyBookingAccess(therapistId: number, bookingId: number): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { therapistId: true }
    });

    if (!booking) {
      throw new ForbiddenException('Agendamento não encontrado');
    }

    return booking.therapistId === therapistId;
  }
}
