import api from './api';

export interface BookingDto {
  id: number;
  title: string;
  start: string;
  end: string;
  roomId: number;
  therapistId: number;
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


