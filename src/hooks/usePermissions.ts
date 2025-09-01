import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listClientsByTherapist } from '@/services/clients';
import { type Client } from '@/services/clients';

export function usePermissions() {
  const { user: currentUser } = useAuth();
  const [responsibleClients, setResponsibleClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  
  useEffect(() => {
    if (currentUser) {
      loadResponsibleClients();
    } else {
      setResponsibleClients([]);
    }
  }, [currentUser]);

  const loadResponsibleClients = async () => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      setResponsibleClients([]);
      return;
    }

    try {
      setIsLoadingClients(true);
      const clients = await listClientsByTherapist(Number(currentUser.id));
      setResponsibleClients(clients);
    } catch (error) {
      console.error('Erro ao carregar clientes responsável:', error);
      setResponsibleClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const canViewClient = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canEditClient = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canDeleteClient = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  
  const canViewMedicalRecord = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canEditMedicalRecord = (clientId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return currentUser.id === therapistId.toString() && 
           responsibleClients.some(client => client.id === clientId);
  };

  const canDeleteMedicalRecord = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canCreateMedicalRecord = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  
  const canViewBooking = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canEditBooking = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  const canDeleteBooking = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  // NOVO: Verificações específicas para agendamentos
  const canViewBookingDetails = (bookingId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    // Terapeuta só pode ver seus próprios agendamentos
    return currentUser.id === therapistId.toString();
  };

  const canEditBookingDetails = (bookingId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    // Terapeuta só pode editar seus próprios agendamentos
    return currentUser.id === therapistId.toString();
  };

  // NOVO: Verificações específicas para prontuários
  const canViewMedicalRecordDetails = (recordId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    // Terapeuta só pode ver seus próprios prontuários
    return currentUser.id === therapistId.toString();
  };

  const canEditMedicalRecordDetails = (recordId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    // Terapeuta só pode editar seus próprios prontuários
    return currentUser.id === therapistId.toString();
  };

  
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTherapist = currentUser?.role === 'THERAPIST';

  
  const getFilteredClients = (allClients: Client[]): Client[] => {
    
    if (isAdmin) return allClients;
    
    return allClients.filter(client => canViewClient(client.id));
  };

  
  const canAccessClientData = (clientId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'ADMIN') return true;
    
    return responsibleClients.some(client => client.id === clientId);
  };

  
  const getPermissionBasedStats = (allData: any[], dataType: 'clients' | 'records' | 'bookings') => {
    if (isAdmin) {
      
      return {
        total: allData.length,
        data: allData
      };
    } else {
      
      const filteredData = allData.filter(item => {
        if (dataType === 'clients') {
          return canViewClient(item.id);
        } else if (dataType === 'records') {
          return canViewMedicalRecord(item.clientId);
        } else if (dataType === 'bookings') {
          return canViewBooking(item.clientId);
        }
        return false;
      });
      
      return {
        total: filteredData.length,
        data: filteredData
      };
    }
  };

  return {
    // Permissões básicas de cliente
    canViewClient,
    canEditClient,
    canDeleteClient,
    
    // Permissões de prontuário
    canViewMedicalRecord,
    canEditMedicalRecord,
    canDeleteMedicalRecord,
    canCreateMedicalRecord,
    canViewMedicalRecordDetails,
    canEditMedicalRecordDetails,
    
    // Permissões de agendamento
    canViewBooking,
    canEditBooking,
    canDeleteBooking,
    canViewBookingDetails,
    canEditBookingDetails,
    
    // Estado dos clientes responsável
    responsibleClients,
    isLoadingClients,
    
    // Roles
    isAdmin,
    isTherapist,
    
    // Utilitários
    getFilteredClients,
    canAccessClientData,
    getPermissionBasedStats,
    refreshPermissions: loadResponsibleClients
  };
}
