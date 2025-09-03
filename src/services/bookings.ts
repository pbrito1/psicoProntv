import api from './api';

export interface BookingDto {
  id: number;
  title: string;
  start: string;
  end: string;
  roomId: number;
  therapistId: number;
  clientId?: number;
  clientName?: string;
  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  description?: string;
  room?: {
    id: number;
    name: string;
    capacity: number;
  };
  medicalRecord?: {
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
  };
}

export async function listBookings(date?: string): Promise<BookingDto[]> {
  const { data } = await api.get('/bookings', { params: { date } });
  return data;
}

export async function createBooking(payload: Omit<BookingDto, 'id'>): Promise<BookingDto> {
  const { data } = await api.post('/bookings', payload);
  return data;
}

export async function updateBooking(id: number, payload: Partial<Omit<BookingDto, 'id'>>): Promise<BookingDto> {
  const { data } = await api.patch(`/bookings/${id}`, payload);
  return data;
}

export async function deleteBooking(id: number): Promise<void> {
  await api.delete(`/bookings/${id}`);
}


