import { api } from './api';

export interface GuardianAccountData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface CreateParentAccountsRequest {
  clientId: number;
  motherName?: string;
  motherEmail?: string;
  motherPhone?: string;
  fatherName?: string;
  fatherEmail?: string;
  fatherPhone?: string;
}

export interface ParentAccountResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface CreateParentAccountsResponse {
  clientId: number;
  generatedAccounts: ParentAccountResponse[];
  message: string;
}

export interface Guardian {
  id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

export const guardiansService = {
  /**
   * Gera contas de pais para um cliente
   */
  async generateParentAccounts(data: CreateParentAccountsRequest): Promise<CreateParentAccountsResponse> {
    const response = await api.post('/guardians/generate-parent-accounts', data);
    return response.data;
  },

  /**
   * Lista os pais de um cliente
   */
  async getClientGuardians(clientId: number): Promise<Guardian[]> {
    const response = await api.get(`/guardians/client/${clientId}/guardians`);
    return response.data;
  },

  /**
   * Remove vinculação de um pai com um cliente
   */
  async unlinkGuardianFromClient(clientId: number, guardianId: number): Promise<void> {
    await api.delete(`/guardians/client/${clientId}/guardian/${guardianId}`);
  },

  /**
   * Atualiza CPF de um pai
   */
  async updateGuardianCPF(guardianId: number, cpf: string): Promise<void> {
    await api.post(`/guardians/update-cpf/${guardianId}`, { cpf });
  },

  /**
   * Login de um pai no GuardianPortal
   */
  async login(email: string, password: string): Promise<any> {
    const response = await api.post('/auth/guardian/login', { email, password });
    return response.data;
  },

  /**
   * Registro de um pai no GuardianPortal
   */
  async register(data: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    relationship: string;
    password: string;
  }): Promise<any> {
    const response = await api.post('/auth/guardian/register', data);
    return response.data;
  },

  /**
   * Busca perfil de um pai
   */
  async getProfile(): Promise<any> {
    const response = await api.get('/auth/guardian/profile');
    return response.data;
  },

  /**
   * Busca filhos de um pai
   */
  async getChildren(): Promise<any[]> {
    const response = await api.get('/guardians/children');
    return response.data;
  },

  /**
   * Busca sessões de um filho
   */
  async getChildSessions(childId: number): Promise<any[]> {
    const response = await api.get(`/guardians/children/${childId}/sessions`);
    return response.data;
  },

  /**
   * Busca prontuários de um filho
   */
  async getChildMedicalRecords(childId: number): Promise<any[]> {
    const response = await api.get(`/guardians/children/${childId}/medical-records`);
    return response.data;
  },
};
