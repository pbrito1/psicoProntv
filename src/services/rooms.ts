import api from './api';

export interface RoomDto {
  id: number;
  name: string;
  capacity: number;
  resources?: string[];
  openingTime?: string;
  closingTime?: string;
  description?: string;
}

export async function listRooms(): Promise<RoomDto[]> {
  const { data } = await api.get('/rooms');
  return data;
}

export async function createRoom(payload: Omit<RoomDto, 'id'>): Promise<RoomDto> {
  const { data } = await api.post('/rooms', payload);
  return data;
}

export async function updateRoom(id: number, payload: Partial<Omit<RoomDto, 'id'>>): Promise<RoomDto> {
  const { data } = await api.patch(`/rooms/${id}`, payload);
  return data;
}

export async function deleteRoom(id: number): Promise<void> {
  await api.delete(`/rooms/${id}`);
}


