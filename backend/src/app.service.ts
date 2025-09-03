import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'PsicoProntv API is running!';
  }

  async cleanupOldData() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deletedNotifications = await this.prisma.notification.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
          isRead: true
        }
      });

      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const deletedBookings = await this.prisma.booking.deleteMany({
        where: {
          status: 'CANCELLED',
          end: { lt: oneYearAgo }
        }
      });

      return {
        message: 'Limpeza concluída',
        deletedNotifications: deletedNotifications.count,
        deletedBookings: deletedBookings.count
      };
    } catch (error) {
      throw new Error('Erro durante a limpeza de dados');
    }
  }

  async checkDataIntegrity() {
    try {
      const issues = [];

      const bookingsWithoutClient = await this.prisma.booking.findMany({
        where: {
          clientId: { equals: null }
        }
      });

      if (bookingsWithoutClient.length > 0) {
        issues.push(`Encontrados ${bookingsWithoutClient.length} agendamentos sem cliente`);
      }

      const medicalRecordsWithoutBooking = await this.prisma.medicalRecord.findMany({
        where: {
          bookingId: { equals: null }
        }
      });

      if (medicalRecordsWithoutBooking.length > 0) {
        issues.push(`Encontrados ${medicalRecordsWithoutBooking.length} prontuários sem agendamento`);
      }

      return {
        status: issues.length === 0 ? 'OK' : 'ISSUES_FOUND',
        issues,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Erro ao verificar integridade dos dados');
    }
  }

  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalClients,
        totalBookings,
        totalMedicalRecords,
        activeBookings,
        pendingNotifications
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.client.count(),
        this.prisma.booking.count(),
        this.prisma.medicalRecord.count(),
        this.prisma.booking.count({
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }),
        this.prisma.notification.count({
          where: { isRead: false }
        })
      ]);

      return {
        totalUsers,
        totalClients,
        totalBookings,
        totalMedicalRecords,
        activeBookings,
        pendingNotifications,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Erro ao obter estatísticas do sistema');
    }
  }
}
