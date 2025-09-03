import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  type Client, 
  type MedicalRecord, 
  listClientsByTherapist,
  listMedicalRecords
} from '@/services/clients';
import { type BookingDto, listBookings } from '@/services/bookings';
import moment from 'moment';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
}

export function TherapistDashboard() {
  const { user: currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    cancelledSessions: 0,
    thisWeekSessions: 0,
    thisMonthSessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados do terapeuta
  useEffect(() => {
    if (currentUser) {
      loadTherapistData();
    }
  }, [currentUser]);

  const loadTherapistData = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Carregar clientes do terapeuta
      const therapistClients = await listClientsByTherapist(Number(currentUser.id));
      setClients(therapistClients);
      
      // Carregar prontuários dos clientes
      const allRecords: MedicalRecord[] = [];
      for (const client of therapistClients) {
        const clientRecords = await listMedicalRecords(client.id.toString());
        allRecords.push(...clientRecords);
      }
      setMedicalRecords(allRecords);
      
      // Carregar agendamentos
      const allBookings = await listBookings();
      const therapistBookings = allBookings.filter(booking => 
        therapistClients.some(client => client.id === booking.clientId)
      );
      setBookings(therapistBookings);
      
      // Calcular estatísticas apenas para os clientes responsável
      calculateStats(therapistClients, allRecords, therapistBookings);
      
    } catch (error) {
      toast.error('Erro ao carregar dados do terapeuta');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (therapistClients: Client[], records: MedicalRecord[], bookings: BookingDto[]) => {
    const now = moment();
    const startOfWeek = moment().startOf('week');
    const startOfMonth = moment().startOf('month');
    
    const thisWeekSessions = bookings.filter(booking => 
      moment(booking.start).isBetween(startOfWeek, now, 'day', '[]')
    ).length;
    
    const thisMonthSessions = bookings.filter(booking => 
      moment(booking.start).isBetween(startOfMonth, now, 'day', '[]')
    ).length;

    setStats({
      totalClients: therapistClients.length,
      activeClients: therapistClients.length, // Todos os clientes são considerados ativos por enquanto
      totalSessions: records.length,
      completedSessions: 0, // TODO: Implementar status nos bookings
      pendingSessions: bookings.length, // Todos os bookings são considerados pendentes por enquanto
      cancelledSessions: 0, // TODO: Implementar status nos bookings
      thisWeekSessions,
      thisMonthSessions
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componentes de Skeleton
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ClientSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Faça login para acessar o dashboard</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Terapeuta</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo, {currentUser.name} - {currentUser.specialty}
          </p>
        </div>
        <Button onClick={() => window.location.href = '/clients'}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Visão Geral</h2>
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Esta Semana</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Este Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonthSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Total mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Prontuários criados
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status dos Agendamentos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Status dos Agendamentos</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{stats.completedSessions}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Sessões Concluídas</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-600">{stats.pendingSessions}</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">Sessões Pendentes</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{stats.cancelledSessions}</span>
                </div>
                <p className="text-sm text-red-600 mt-1">Sessões Canceladas</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Meus Clientes</TabsTrigger>
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="records">Prontuários</TabsTrigger>
        </TabsList>

        {/* Tab de Clientes */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Clientes Responsável</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <ClientSkeleton key={i} />)}
            </div>
          ) : filteredClients.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar os termos de busca.' : 'Você ainda não tem clientes responsável.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{client.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{client.email}</span>
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {client.agreement || 'Particular'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {client.therapists.length} terapeuta(s)
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab de Agendamentos */}
        <TabsContent value="bookings" className="space-y-4">
          <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <ClientSkeleton key={i} />)}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500">Você não tem agendamentos próximos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookings.slice(0, 5).map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{booking.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{moment(booking.start).format('DD/MM/YYYY HH:mm')}</span>
                          <span>{moment(booking.start).fromNow()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            Agendado
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab de Prontuários */}
        <TabsContent value="records" className="space-y-4">
          <h3 className="text-lg font-semibold">Últimos Prontuários</h3>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <ClientSkeleton key={i} />)}
            </div>
          ) : medicalRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prontuário</h3>
                <p className="text-gray-500">Você ainda não criou prontuários.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {medicalRecords.slice(0, 5).map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          Sessão {record.sessionType === 'INDIVIDUAL' ? 'Individual' : 
                                 record.sessionType === 'FAMILY' ? 'Familiar' : 'Grupo'}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{moment(record.sessionDate).format('DD/MM/YYYY')}</span>
                          <span>{record.sessionDuration} min</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {record.subjective}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
