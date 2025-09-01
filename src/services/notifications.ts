import api from './api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  metadata?: any;
  booking?: {
    id: number;
    start: string;
    end: string;
    room: { name: string };
    therapist: { name: string };
    client: { name: string };
  };
  client?: {
    id: number;
    name: string;
  };
  therapist?: {
    id: number;
    name: string;
  };
}

export interface CreateNotificationDto {
  type: string;
  title: string;
  message: string;
  priority: string;
  guardianId: number;
  bookingId?: number;
  clientId?: number;
  therapistId?: number;
  metadata?: any;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  title?: string;
  message?: string;
  priority?: string;
}

class NotificationsService {
  // Buscar notificações do guardião
  async getGuardianNotifications(includeRead = false): Promise<Notification[]> {
    try {
      const response = await api.get(`/notifications/guardian/me?includeRead=${includeRead}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  // Marcar notificação como lida
  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/guardian/me/read-all');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  // Buscar notificação por ID
  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      throw error;
    }
  }

  // Atualizar notificação
  async updateNotification(id: number, data: UpdateNotificationDto): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      throw error;
    }
  }

  // Deletar notificação
  async deleteNotification(id: number): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }

  // Criar notificação (apenas para terapeutas/admin)
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      const response = await api.post('/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Simular notificações em tempo real (WebSocket seria ideal)
  subscribeToNotifications(callback: (notification: Notification) => void): NodeJS.Timeout {
    // Em uma implementação real, isso seria um WebSocket
    // Por enquanto, vamos simular com polling
    return setInterval(async () => {
      try {
        const notifications = await this.getGuardianNotifications(false);
        const newNotifications = notifications.filter(n => !n.isRead);
        newNotifications.forEach(callback);
      } catch (error) {
        console.error('Erro ao verificar novas notificações:', error);
      }
    }, 30000); // Verificar a cada 30 segundos
  }
}

export const notificationsService = new NotificationsService();
