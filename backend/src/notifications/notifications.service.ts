import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Criar notificação para um agendamento
  async createBookingNotification(
    guardianId: number,
    bookingId: number,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    metadata?: any,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, therapist: true },
    });

    if (!booking) {
      throw new Error('Agendamento não encontrado');
    }

    return this.prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        guardianId,
        bookingId,
        clientId: booking.clientId || undefined,
        therapistId: booking.therapistId,
        metadata,
      },
      include: {
        guardian: true,
        booking: true,
        client: true,
        therapist: true,
      },
    });
  }

  // Criar notificação geral
  async createGeneralNotification(
    guardianId: number,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    metadata?: any,
  ) {
    return this.prisma.notification.create({
      data: {
        type: NotificationType.GENERAL,
        title,
        message,
        priority,
        guardianId,
        metadata,
      },
      include: {
        guardian: true,
        client: true,
        therapist: true,
      },
    });
  }

  // Buscar notificações de um guardião
  async findGuardianNotifications(guardianId: number, includeRead = false) {
    const where: any = { guardianId };
    
    if (!includeRead) {
      where.isRead = false;
    }

    return this.prisma.notification.findMany({
      where,
      include: {
        booking: {
          include: {
            client: true,
            therapist: true,
            room: true,
          },
        },
        client: true,
        therapist: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Marcar notificação como lida
  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Marcar todas as notificações de um guardião como lidas
  async markAllAsRead(guardianId: number) {
    return this.prisma.notification.updateMany({
      where: { guardianId, isRead: false },
      data: { isRead: true },
    });
  }

  // Deletar notificação
  async remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Buscar notificação por ID
  async findOne(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        guardian: true,
        booking: {
          include: {
            client: true,
            therapist: true,
            room: true,
          },
        },
        client: true,
        therapist: true,
      },
    });
  }

  // Atualizar notificação
  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
      include: {
        guardian: true,
        booking: true,
        client: true,
        therapist: true,
      },
    });
  }

  // Criar notificação automática para novo agendamento
  async notifyNewBooking(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            guardians: true,
          },
        },
        therapist: true,
        room: true,
      },
    });

    if (!booking || !booking.client) {
      return;
    }

    // Criar notificação para cada guardião do cliente
    const notifications = [];
    
    for (const guardian of booking.client.guardians) {
      const notification = await this.createBookingNotification(
        guardian.id,
        bookingId,
        NotificationType.BOOKING_CREATED,
        'Novo Agendamento',
        `Novo agendamento marcado para ${booking.client.name} com ${booking.therapist.name} em ${booking.room.name} no dia ${new Date(booking.start).toLocaleDateString('pt-BR')} às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        NotificationPriority.NORMAL,
        {
          sessionDate: booking.start,
          sessionEnd: booking.end,
          roomName: booking.room.name,
          therapistName: booking.therapist.name,
          clientName: booking.client.name,
        },
      );
      
      notifications.push(notification);
    }

    return notifications;
  }

  // Criar notificação para agendamento cancelado
  async notifyCancelledBooking(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            guardians: true,
          },
        },
        therapist: true,
        room: true,
      },
    });

    if (!booking || !booking.client) {
      return;
    }

    const notifications = [];
    
    for (const guardian of booking.client.guardians) {
      const notification = await this.createBookingNotification(
        guardian.id,
        bookingId,
        NotificationType.BOOKING_CANCELLED,
        'Agendamento Cancelado',
        `O agendamento de ${booking.client.name} com ${booking.therapist.name} em ${booking.room.name} no dia ${new Date(booking.start).toLocaleDateString('pt-BR')} às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} foi cancelado.`,
        NotificationPriority.HIGH,
        {
          sessionDate: booking.start,
          roomName: booking.room.name,
          therapistName: booking.therapist.name,
          clientName: booking.client.name,
        },
      );
      
      notifications.push(notification);
    }

    return notifications;
  }

  // Criar notificação para agendamento atualizado
  async notifyUpdatedBooking(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            guardians: true,
          },
        },
        therapist: true,
        room: true,
      },
    });

    if (!booking || !booking.client) {
      return;
    }

    const notifications = [];
    
    for (const guardian of booking.client.guardians) {
      const notification = await this.createBookingNotification(
        guardian.id,
        bookingId,
        NotificationType.BOOKING_UPDATED,
        'Agendamento Atualizado',
        `O agendamento de ${booking.client.name} com ${booking.therapist.name} foi atualizado. Nova data: ${new Date(booking.start).toLocaleDateString('pt-BR')} às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} em ${booking.room.name}.`,
        NotificationPriority.NORMAL,
        {
          sessionDate: booking.start,
          sessionEnd: booking.end,
          roomName: booking.room.name,
          therapistName: booking.therapist.name,
          clientName: booking.client.name,
        },
      );
      
      notifications.push(notification);
    }

    return notifications;
  }

  // Criar lembrete de agendamento (24h antes)
  async createBookingReminder(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          include: {
            guardians: true,
          },
        },
        therapist: true,
        room: true,
      },
    });

    if (!booking || !booking.client) {
      return;
    }

    const notifications = [];
    
    for (const guardian of booking.client.guardians) {
      const notification = await this.createBookingNotification(
        guardian.id,
        bookingId,
        NotificationType.BOOKING_REMINDER,
        'Lembrete de Sessão',
        `Lembrete: ${booking.client.name} tem sessão amanhã às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} com ${booking.therapist.name} em ${booking.room.name}.`,
        NotificationPriority.HIGH,
        {
          sessionDate: booking.start,
          roomName: booking.room.name,
          therapistName: booking.therapist.name,
          clientName: booking.client.name,
        },
      );
      
      notifications.push(notification);
    }

    return notifications;
  }
}
