import api from './api';

export interface UserDto {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  specialty?: string | null;
  role: 'ADMIN' | 'THERAPIST';
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  role: 'ADMIN' | 'THERAPIST';
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  password?: string;
}

export async function listUsers(): Promise<UserDto[]> {
  const { data } = await api.get('/users');
  return data;
}

export async function getUser(id: string): Promise<UserDto> {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

export async function createUser(userData: CreateUserDto): Promise<UserDto> {
  const { data } = await api.post('/users', userData);
  return data;
}

export async function updateUser(id: string, userData: UpdateUserDto): Promise<UserDto> {
  const { data } = await api.patch(`/users/${id}`, userData);
  return data;
}

export async function updateUserProfile(userData: UpdateUserDto): Promise<UserDto> {
  const { data } = await api.patch('/users/profile', userData);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}


