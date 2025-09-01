import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuardianProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  relationship: string;
  isPrimary: boolean;
  canViewRecords: boolean;
  canBookSessions: boolean;
  canCancelSessions: boolean;
  canViewBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export const GuardianProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
  });

  // Mock data para demonstração
  useEffect(() => {
    const mockProfile: GuardianProfile = {
      id: 1,
      name: 'Carlos Silva',
      email: 'pai1@exemplo.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      relationship: 'Pai',
      isPrimary: true,
      canViewRecords: true,
      canBookSessions: false,
      canCancelSessions: false,
      canViewBilling: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    setProfile(mockProfile);
    setFormData({
      name: mockProfile.name,
      email: mockProfile.email,
      phone: mockProfile.phone,
      relationship: mockProfile.relationship,
    });
    setLoading(false);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Aqui você implementaria a chamada para a API
      // await updateGuardianProfile(formData);
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar o perfil local
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          updatedAt: new Date().toISOString(),
        });
      }
      
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        relationship: profile.relationship,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/guardian')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
            <p className="text-gray-600 text-lg">
              Gerencie suas informações pessoais e permissões de acesso
            </p>
          </div>
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {profile.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {profile.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {profile.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relacionamento</Label>
                  {isEditing ? (
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleInputChange('relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o relacionamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pai">Pai</SelectItem>
                        <SelectItem value="Mãe">Mãe</SelectItem>
                        <SelectItem value="Avô">Avô</SelectItem>
                        <SelectItem value="Avó">Avó</SelectItem>
                        <SelectItem value="Tio">Tio</SelectItem>
                        <SelectItem value="Tia">Tia</SelectItem>
                        <SelectItem value="Responsável Legal">Responsável Legal</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border">
                      {profile.relationship}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>CPF</Label>
                <div className="p-3 bg-gray-50 rounded-md border text-gray-600">
                  {profile.cpf} <Badge variant="secondary" className="ml-2">Não editável</Badge>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Atividades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Perfil atualizado</p>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(profile.updatedAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">Atualização</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Conta criada</p>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(profile.createdAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">Criação</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Permissões e Status */}
        <div className="space-y-6">
          {/* Status da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="default">Ativa</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo de Conta</span>
                <Badge variant={profile.isPrimary ? "default" : "secondary"}>
                  {profile.isPrimary ? "Principal" : "Secundária"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última Atualização</span>
                <span className="text-xs text-gray-500">
                  {new Date(profile.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Permissões de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visualizar Prontuários</span>
                <Badge variant={profile.canViewRecords ? "default" : "secondary"}>
                  {profile.canViewRecords ? "Permitido" : "Negado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agendar Sessões</span>
                <Badge variant={profile.canBookSessions ? "default" : "secondary"}>
                  {profile.canBookSessions ? "Permitido" : "Negado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelar Sessões</span>
                <Badge variant={profile.canCancelSessions ? "default" : "secondary"}>
                  {profile.canCancelSessions ? "Permitido" : "Negado"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visualizar Faturamento</span>
                <Badge variant={profile.canViewBilling ? "default" : "secondary"}>
                  {profile.canViewBilling ? "Permitido" : "Negado"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Alterar Email
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Alterar Telefone
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuardianProfile;
