import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(guardianId: number) {
    return this.prisma.notification.updateMany({
      where: { guardianId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async findOne(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        guardian: true,
        booking: true,
        client: true,
        therapist: true,
      },
    });
  }

  async update(id: number, updateNotificationDto: any) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

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
        `O agendamento de ${booking.client.name} com ${booking.therapist.name} em ${booking.room.name} no dia ${new Date(booking.start).toLocaleDateString('pt-BR')} às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} foi atualizado.`,
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
        'Lembrete de Agendamento',
        `Lembrete: amanhã às ${new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} você tem agendamento com ${booking.therapist.name} em ${booking.room.name}.`,
        NotificationPriority.HIGH,
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

  async sendReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        start: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: 'CONFIRMED',
      },
      include: {
        client: {
          include: {
            guardians: true,
          },
        },
      },
    });

    const reminders = [];
    for (const booking of bookings) {
      const reminder = await this.createBookingReminder(booking.id);
      if (reminder) {
        reminders.push(...reminder);
      }
    }

    return reminders;
  }
}
