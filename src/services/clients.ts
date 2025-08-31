import api from './api';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  motherName: string;
  motherPhone: string;
  motherEmail: string;
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  agreement: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  therapists: number[]; // IDs dos terapeutas responsáveis
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  agreement: string;
  motherName: string;
  motherPhone: string;
  motherEmail: string;
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  therapists: number[]; // IDs dos terapeutas responsáveis
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  agreement?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  therapists?: number[]; // IDs dos terapeutas responsáveis
}

export interface MedicalRecord {
  id: number;
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
  bookingId?: number; 
  motherName: string;
  motherPhone: string;
  motherEmail: string;
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  agreement: string;
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
  bookingId?: number; 
  motherName: string;
  motherPhone: string;
  motherEmail: string;
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  agreement: string;
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
  bookingId?: number; 
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  agreement?: string;
}


export async function listClients(): Promise<Client[]> {
  
  const { mockListClients } = await import('./mockClients');
  return mockListClients();
}

export async function listClientsByTherapist(therapistId: number): Promise<Client[]> {
  const { mockListClientsByTherapist } = await import('./mockClients');
  return mockListClientsByTherapist(therapistId);
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function createClient(clientData: CreateClientDto): Promise<Client> {
  
  const { mockCreateClient } = await import('./mockClients');
  return mockCreateClient(clientData);
}

export async function updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
  
  const { mockUpdateClient } = await import('./mockClients');
  return mockUpdateClient(parseInt(id), clientData);
}

export async function deleteClient(id: string): Promise<void> {
  
  const { mockDeleteClient } = await import('./mockClients');
  return mockDeleteClient(parseInt(id));
}


export async function listMedicalRecords(clientId?: string): Promise<MedicalRecord[]> {
  
  const { mockListMedicalRecords } = await import('./mockClients');
  return mockListMedicalRecords(clientId);
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord> {
  const { data } = await api.get(`/medical-records/${id}`);
  return data;
}

export async function createMedicalRecord(recordData: CreateMedicalRecordDto): Promise<MedicalRecord> {
  
  const { mockCreateMedicalRecord } = await import('./mockClients');
  return mockCreateMedicalRecord(recordData);
}

export async function updateMedicalRecord(id: string, recordData: UpdateMedicalRecordDto): Promise<MedicalRecord> {
  
  const { mockUpdateMedicalRecord } = await import('./mockClients');
  return mockUpdateMedicalRecord(parseInt(id), recordData);
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  
  const { mockDeleteMedicalRecord } = await import('./mockClients');
  return mockDeleteMedicalRecord(parseInt(id));
}


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
  
  const { mockGetClientBookings } = await import('./mockClients');
  return mockGetClientBookings(clientId);
}
