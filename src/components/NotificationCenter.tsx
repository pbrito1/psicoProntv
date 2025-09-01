import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { notificationsService } from '../services/notifications';
import type { Notification } from '../services/notifications';

interface NotificationCenterProps {}

const NotificationCenter: React.FC<NotificationCenterProps> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: Implementar dados reais da API

  useEffect(() => {
    // Carregar notificações reais
    const loadNotifications = async () => {
      try {
        const notifications = await notificationsService.getGuardianNotifications();
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        // Fallback para lista vazia em caso de erro
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();

    // Inscrever para notificações em tempo real
    const intervalId = notificationsService.subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      // Cleanup da inscrição
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'NORMAL':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'LOW':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return 'bg-green-100 text-green-800';
      case 'BOOKING_UPDATED':
        return 'bg-blue-100 text-blue-800';
      case 'BOOKING_CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'BOOKING_REMINDER':
        return 'bg-orange-100 text-orange-800';
      case 'SESSION_COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'MEDICAL_RECORD_UPDATE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return 'Novo Agendamento';
      case 'BOOKING_UPDATED':
        return 'Agendamento Atualizado';
      case 'BOOKING_CANCELLED':
        return 'Agendamento Cancelado';
      case 'BOOKING_REMINDER':
        return 'Lembrete';
      case 'SESSION_COMPLETED':
        return 'Sessão Concluída';
      case 'MEDICAL_RECORD_UPDATE':
        return 'Prontuário Atualizado';
      default:
        return 'Geral';
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getTypeColor(notification.type)}`}
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">
                                Nova
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1">
                            {notification.title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.booking && (
                            <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
                              <p><strong>Sala:</strong> {notification.booking.room.name}</p>
                              <p><strong>Terapeuta:</strong> {notification.booking.therapist.name}</p>
                              <p><strong>Data:</strong> {new Date(notification.booking.start).toLocaleDateString('pt-BR')}</p>
                              <p><strong>Horário:</strong> {new Date(notification.booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
