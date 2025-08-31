import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  birthDate: string;
  nextSession?: string;
}

interface Session {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  therapist: {
    name: string;
    specialty: string;
  };
  room: {
    name: string;
  };
}

interface MedicalRecord {
  id: number;
  sessionDate: string;
  sessionType: string;
  sessionDuration: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  therapist: {
    name: string;
    specialty: string;
  };
}

export const GuardianPortal: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data para demonstração
  useEffect(() => {
    const mockChildren: Child[] = [
      {
        id: 1,
        name: 'João Silva',
        birthDate: '2018-05-15',
        nextSession: '2024-01-15T14:00:00Z',
      },
      {
        id: 2,
        name: 'Maria Silva',
        birthDate: '2020-03-22',
        nextSession: '2024-01-16T10:00:00Z',
      },
    ];

    const mockSessions: Session[] = [
      {
        id: 1,
        title: 'Sessão de Terapia Ocupacional',
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T15:00:00Z',
        status: 'CONFIRMED',
        therapist: {
          name: 'Dra. Ana Santos',
          specialty: 'Terapia Ocupacional',
        },
        room: { name: 'Sala 3' },
      },
      {
        id: 2,
        title: 'Avaliação Psicológica',
        start: '2024-01-10T10:00:00Z',
        end: '2024-01-10T11:00:00Z',
        status: 'COMPLETED',
        therapist: {
          name: 'Dr. Carlos Mendes',
          specialty: 'Psicologia Infantil',
        },
        room: { name: 'Sala 1' },
      },
    ];

    const mockMedicalRecords: MedicalRecord[] = [
      {
        id: 1,
        sessionDate: '2024-01-10T10:00:00Z',
        sessionType: 'INDIVIDUAL',
        sessionDuration: 60,
        subjective: 'João demonstrou melhora na concentração e interação social',
        objective: 'Participou ativamente das atividades propostas, manteve foco por períodos mais longos',
        assessment: 'Progresso significativo nas habilidades sociais e cognitivas',
        plan: 'Continuar com exercícios de concentração e atividades em grupo',
        therapist: {
          name: 'Dr. Carlos Mendes',
          specialty: 'Psicologia Infantil',
        },
      },
    ];

    setChildren(mockChildren);
    setSessions(mockSessions);
    setMedicalRecords(mockMedicalRecords);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Portal dos Pais</h1>
        <p className="text-gray-600 text-lg">
          Acompanhe o desenvolvimento e progresso dos seus filhos
        </p>
      </div>

      {/* Seleção de Filho */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Seus Filhos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card 
              key={child.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedChild?.id === child.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedChild(child)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{child.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Nascido em {new Date(child.birthDate).toLocaleDateString('pt-BR')}
                    </p>
                    {child.nextSession && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Próxima sessão: {new Date(child.nextSession).toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedChild && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedChild.name} - Visão Geral
            </h2>
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contatar Terapeuta
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="sessions">Sessões</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Dashboard com métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Sessões Realizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">24</div>
                    <p className="text-xs text-gray-500 mt-1">Este ano</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Frequência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">92%</div>
                    <p className="text-xs text-gray-500 mt-1">Taxa de presença</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Objetivos Alcançados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">8</div>
                    <p className="text-xs text-gray-500 mt-1">De 12 metas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Próximas atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Próximas Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessions
                      .filter(s => s.status === 'CONFIRMED')
                      .slice(0, 3)
                      .map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(session.start).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(session.start).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{session.room.name}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Histórico de Sessões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{session.title}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(session.start).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(session.start).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })} - {new Date(session.end).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{session.therapist.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{session.room.name}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={session.status === 'CONFIRMED' ? 'default' : 'secondary'}
                            className="ml-4"
                          >
                            {session.status === 'CONFIRMED' ? 'Confirmada' : 
                             session.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso Terapêutico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-lg">Gráficos de progresso serão implementados aqui</p>
                    <p className="text-sm">Visualização de evolução ao longo do tempo</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos e Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {medicalRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">
                            Relatório de Sessão - {new Date(record.sessionDate).toLocaleDateString('pt-BR')}
                          </h4>
                          <Badge variant="outline">{record.sessionType}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <strong>Terapeuta:</strong> {record.therapist.name}
                          </div>
                          <div>
                            <strong>Duração:</strong> {record.sessionDuration} minutos
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong className="text-gray-700">Queixa Principal:</strong>
                            <p className="text-gray-600 mt-1">{record.subjective}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Observações:</strong>
                            <p className="text-gray-600 mt-1">{record.objective}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Avaliação:</strong>
                            <p className="text-gray-600 mt-1">{record.assessment}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Plano Terapêutico:</strong>
                            <p className="text-gray-600 mt-1">{record.plan}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar por Email
                          </Button>
                          <Button variant="outline" size="sm">
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
