import api from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string, name?: string) {
  const { data } = await api.post('/auth/register', { email, password, name });
  return data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}
