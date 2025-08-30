import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/users';
import { toast } from 'sonner';

export function ProfileEdit() {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    password: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        specialty: currentUser.specialty || '',
        password: ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Remover campos vazios para não sobrescrever dados existentes
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      
      await updateUserProfile(updateData);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Atualizar o contexto local se necessário
      // Você pode implementar uma função para atualizar o usuário no contexto
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error('Erro:', error);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        specialty: currentUser.specialty || '',
        password: ''
      });
    }
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e profissionais
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Ex: Psicologia Clínica"
                />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha (deixe em branco para manter a atual)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </form>

          {!isEditing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Informações do Perfil</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Função:</strong> {currentUser.role === 'ADMIN' ? 'Administrador' : 'Terapeuta'}</p>
                <p><strong>Nome:</strong> {currentUser.name || 'Não informado'}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Telefone:</strong> {currentUser.phone || 'Não informado'}</p>
                <p><strong>Especialidade:</strong> {currentUser.specialty || 'Não informada'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
