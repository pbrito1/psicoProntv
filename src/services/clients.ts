import api from './api';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
}

export interface MedicalRecord {
  id: number;
  clientId: number;
  therapistId: number;
  sessionDate: string;
  sessionType: 'INDIVIDUAL' | 'GROUP' | 'FAMILY';
  sessionDuration: number; // em minutos
  subjective: string; // queixa principal
  objective: string; // observações objetivas
  assessment: string; // avaliação
  plan: string; // plano terapêutico
  notes: string; // observações adicionais
  nextSessionDate?: string;
  bookingId?: number; // ID do agendamento relacionado
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordDto {
  clientId: number;
  therapistId: number;
  sessionDate: string;
  sessionType: 'INDIVIDUAL' | 'GROUP' | 'FAMILY';
  sessionDuration: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  notes: string;
  nextSessionDate?: string;
  bookingId?: number; // ID do agendamento relacionado
}

export interface UpdateMedicalRecordDto {
  sessionType?: 'INDIVIDUAL' | 'GROUP' | 'FAMILY';
  sessionDuration?: number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
  nextSessionDate?: string;
  bookingId?: number; // ID do agendamento relacionado
}

// Funções para clientes
export async function listClients(): Promise<Client[]> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockListClients } = await import('./mockClients');
  return mockListClients();
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function createClient(clientData: CreateClientDto): Promise<Client> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockCreateClient } = await import('./mockClients');
  return mockCreateClient(clientData);
}

export async function updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockUpdateClient } = await import('./mockClients');
  return mockUpdateClient(parseInt(id), clientData);
}

export async function deleteClient(id: string): Promise<void> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockDeleteClient } = await import('./mockClients');
  return mockDeleteClient(parseInt(id));
}

// Funções para prontuários
export async function listMedicalRecords(clientId?: string): Promise<MedicalRecord[]> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockListMedicalRecords } = await import('./mockClients');
  return mockListMedicalRecords(clientId);
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord> {
  const { data } = await api.get(`/medical-records/${id}`);
  return data;
}

export async function createMedicalRecord(recordData: CreateMedicalRecordDto): Promise<MedicalRecord> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockCreateMedicalRecord } = await import('./mockClients');
  return mockCreateMedicalRecord(recordData);
}

export async function updateMedicalRecord(id: string, recordData: UpdateMedicalRecordDto): Promise<MedicalRecord> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockUpdateMedicalRecord } = await import('./mockClients');
  return mockUpdateMedicalRecord(parseInt(id), recordData);
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockDeleteMedicalRecord } = await import('./mockClients');
  return mockDeleteMedicalRecord(parseInt(id));
}

// Funções para integração com agendamentos
export async function getMedicalRecordByBooking(bookingId: string): Promise<MedicalRecord | null> {
  const { data } = await api.get(`/medical-records/booking/${bookingId}`);
  return data;
}

export async function createMedicalRecordFromBooking(
  bookingId: string, 
  recordData: Omit<CreateMedicalRecordDto, 'bookingId'>
): Promise<MedicalRecord> {
  const { data } = await api.post(`/medical-records/booking/${bookingId}`, recordData);
  return data;
}

export async function linkMedicalRecordToBooking(
  recordId: string, 
  bookingId: string
): Promise<MedicalRecord> {
  const { data } = await api.patch(`/medical-records/${recordId}/link-booking`, { bookingId });
  return data;
}

export async function getClientBookings(clientId: string): Promise<any[]> {
  // Temporariamente usando dados mock até o backend estar implementado
  const { mockGetClientBookings } = await import('./mockClients');
  return mockGetClientBookings(clientId);
}
