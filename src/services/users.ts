import api from './api';

export interface UserDto {
  id: number;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'THERAPIST';
}

export async function listUsers(): Promise<UserDto[]> {
  const { data } = await api.get('/users');
  return data;
}


