import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listClientsByTherapist } from '@/services/clients';
import { type Client } from '@/services/clients';

export function usePermissions() {
  const { user: currentUser } = useAuth();
  const [responsibleClients, setResponsibleClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Carregar clientes responsável quando o usuário mudar
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

  // Verificações de permissão para clientes
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

  // Verificações de permissão para prontuários
  const canViewMedicalRecord = (clientId: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return responsibleClients.some(client => client.id === clientId);
  };

  const canEditMedicalRecord = (clientId: number, therapistId: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    // Terapeuta só pode editar prontuários que criou
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

  // Verificações de permissão para agendamentos
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

  // Verificações de role
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTherapist = currentUser?.role === 'THERAPIST';

  // Função para filtrar clientes por permissão
  const getFilteredClients = (allClients: Client[]): Client[] => {
    if (isAdmin) return allClients;
    return allClients.filter(client => canViewClient(client.id));
  };

  return {
    // Verificações de permissão
    canViewClient,
    canEditClient,
    canDeleteClient,
    canViewMedicalRecord,
    canEditMedicalRecord,
    canDeleteMedicalRecord,
    canCreateMedicalRecord,
    canViewBooking,
    canEditBooking,
    canDeleteBooking,
    
    // Dados dos clientes responsável
    responsibleClients,
    isLoadingClients,
    
    // Verificações de role
    isAdmin,
    isTherapist,
    
    // Utilitários
    getFilteredClients,
    refreshPermissions: loadResponsibleClients
  };
}
