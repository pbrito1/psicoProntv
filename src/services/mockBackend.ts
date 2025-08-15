import axios from 'axios';
import { redirect } from 'react-router-dom';

const users = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@exemplo.com',
    password: '123456',
    role: 'admin',
    company: 'PsicoPront',
  },
  {
    id: '2',
    name: 'Carlos Souza',
    email: 'carlos@exemplo.com',
    password: 'abcdef',
    role: 'therapist',
    company: 'PsicoPront',
  },
];

 function generateToken(user: typeof users[0]) {
  return btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
}

axios.interceptors.request.use(async (config) => {
  await new Promise((res) => setTimeout(res, 500));

  if (config.url?.endsWith('/login') && config.method === 'post') {
    const { email, password } = config.data;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return Promise.reject({
        response: {
          status: 401,
          data: { error: 'Credenciais inválidas' },
        },
      });
    }
    const access_token = generateToken(user);
    const { password: _, ...userData } = user;
    config.adapter = async () => ({
      data: { access_token, user: userData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  }

  if (config.url?.endsWith('/profile') && config.method === 'get') {
    const auth = config.headers?.Authorization || '';
    const token = (auth as string).replace('Bearer ', '');
    let userData = null;
    try {
      const payload = JSON.parse(atob(token));
      userData = users.find(u => u.id === payload.id);
    } catch {
      redirect('/login');
    }
    if (!userData) {
      return Promise.reject({
        response: {
          status: 401,
          data: { error: 'Token inválido' },
        },
      });
    }
    const { password: _, ...user } = userData;
    config.adapter = async () => ({
      data: user,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  }

  return config;
});
