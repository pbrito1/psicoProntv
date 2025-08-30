import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { createUser, updateUser, deleteUser, listUsers } from '../services/users';
import type { UserDto } from '../services/users';
import { toast } from 'sonner';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    role: 'THERAPIST' as 'ADMIN' | 'THERAPIST',
    password: ''
  });

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await listUsers();
      setUsers(response);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Atualizar usuário existente
        await updateUser(editingUser.id.toString(), formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await createUser(formData);
        toast.success('Usuário criado com sucesso!');
      }
      
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao salvar usuário');
      console.error('Erro:', error);
    }
  };

  const handleEdit = (user: UserDto) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      specialty: user.specialty || '',
      role: user.role,
      password: ''
    });
    setIsCreating(true);
  };

  const handleDelete = async (userId: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId.toString());
        toast.success('Usuário excluído com sucesso!');
        fetchUsers();
      } catch (error) {
        toast.error('Erro ao excluir usuário');
        console.error('Erro:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      role: 'THERAPIST',
      password: ''
    });
    setEditingUser(null);
    setIsCreating(false);
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={() => setIsCreating(true)}>
          {isCreating ? 'Cancelar' : 'Novo Usuário'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
            <CardDescription>
              {editingUser ? 'Atualize as informações do usuário' : 'Preencha as informações para criar um novo usuário'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'ADMIN' | 'THERAPIST') => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THERAPIST">Terapeuta</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Usuários Cadastrados</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-600">Tel: {user.phone}</p>}
                    {user.specialty && <p className="text-sm text-gray-600">Especialidade: {user.specialty}</p>}
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Terapeuta'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(user.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
