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
  try {
    const { data } = await api.get('/clients');
    return data;
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return [];
  }
}

export async function listClientsByTherapist(therapistId: number): Promise<Client[]> {
  try {
    const { data } = await api.get(`/clients/therapist/${therapistId}`);
    return data;
  } catch (error) {
    console.error('Erro ao listar clientes por terapeuta:', error);
    return [];
  }
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function createClient(clientData: CreateClientDto): Promise<Client> {
  try {
    const { data } = await api.post('/clients', clientData);
    return data;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

export async function updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
  try {
    const { data } = await api.patch(`/clients/${id}`, clientData);
    return data;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    await api.delete(`/clients/${id}`);
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
}


export async function listMedicalRecords(clientId?: string): Promise<MedicalRecord[]> {
  try {
    const { data } = await api.get('/medical-records', {
      params: clientId ? { clientId } : {}
    });
    return data;
  } catch (error) {
    console.error('Erro ao listar prontuários:', error);
    return [];
  }
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord> {
  const { data } = await api.get(`/medical-records/${id}`);
  return data;
}

export async function createMedicalRecord(recordData: CreateMedicalRecordDto): Promise<MedicalRecord> {
  try {
    const { data } = await api.post('/medical-records', recordData);
    return data;
  } catch (error) {
    console.error('Erro ao criar prontuário:', error);
    throw error;
  }
}

export async function updateMedicalRecord(id: string, recordData: UpdateMedicalRecordDto): Promise<MedicalRecord> {
  try {
    const { data } = await api.patch(`/medical-records/${id}`, recordData);
    return data;
  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error);
    throw error;
  }
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  try {
    await api.delete(`/medical-records/${id}`);
  } catch (error) {
    console.error('Erro ao deletar prontuário:', error);
    throw error;
  }
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
  try {
    const { data } = await api.get(`/clients/${clientId}/bookings`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar agendamentos do cliente:', error);
    return [];
  }
}
