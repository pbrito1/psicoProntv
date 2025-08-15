import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from './ui/input';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = isRegister ? await register(email, password, name) : await login(email, password);
    setLoading(false);
    console.log(success)
    if (success) {
      navigate('/');
    } else {
      toast(isRegister ? 'Não foi possível criar a conta.' : 'Email ou senha inválidos.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      <h2>{isRegister ? 'Criar conta' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: 16 }}>
            <label>Nome</label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Senha</label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
          {loading ? (isRegister ? 'Criando conta...' : 'Entrando...') : (isRegister ? 'Criar conta' : 'Entrar')}
        </button>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'transparent', color: '#2563eb', textDecoration: 'underline' }}
          >
            {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
