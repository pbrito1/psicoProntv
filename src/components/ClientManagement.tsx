import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  type Client, 
  type CreateClientDto, 
  type MedicalRecord, 
  type CreateMedicalRecordDto,
  listClients,
  createClient,
  updateClient,
  deleteClient,
  listMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getClientBookings
} from '@/services/clients';
import { guardiansService, type CreateParentAccountsRequest } from '@/services/guardians';
import { type BookingDto } from '@/services/bookings';
import { Skeleton } from '@/components/ui/skeleton';

interface GeneratedAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  username: string;
  password: string;
  createdAt: string;
}

export function ClientManagement() {
  const { user: currentUser } = useAuth();
  
  // Logs de debug para verificar funcionamento
  console.log('=== CLIENTMANAGEMENT RENDERIZANDO ===');
  console.log('currentUser:', currentUser);
  console.log('useAuth hook funcionando:', !!useAuth);
  console.log('=== FIM DEBUG ===');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [clientBookings, setClientBookings] = useState<BookingDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  
  // Estados para formulários
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  
  // Estados de loading
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  
  // Formulário de cliente
  const [clientForm, setClientForm] = useState<CreateClientDto>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    agreement: '',
    therapists: [] // IDs dos terapeutas responsáveis
  });
  
  // Formulário de prontuário
  const [recordForm, setRecordForm] = useState<CreateMedicalRecordDto>({
    clientId: 0,
    therapistId: 0,
    sessionDate: new Date().toISOString().split('T')[0],
    sessionType: 'INDIVIDUAL',
    sessionDuration: 50,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
    nextSessionDate: '',
    bookingId: undefined,
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    agreement: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadMedicalRecords(selectedClient.id.toString());
      loadClientBookings(selectedClient.id.toString());
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      setIsLoadingClients(true);
      const data = await listClients();
      setClients(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error(error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const loadMedicalRecords = async (clientId: string) => {
    try {
      setIsLoadingRecords(true);
      const data = await listMedicalRecords(clientId);
      setMedicalRecords(data);
    } catch (error) {
      toast.error('Erro ao carregar prontuários');
      console.error(error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const loadClientBookings = async (clientId: string) => {
    try {
      const data = await getClientBookings(clientId);
      setClientBookings(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos do cliente:', error);
    }
  };

  const handleCreateClient = async () => {
    try {
      setIsSubmitting(true);
      await createClient(clientForm);
      toast.success('Cliente criado com sucesso!');
      setIsClientDialogOpen(false);
      resetClientForm();
      loadClients();
    } catch (error) {
      toast.error('Erro ao criar cliente');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      await updateClient(selectedClient.id.toString(), clientForm);
      toast.success('Cliente atualizado com sucesso!');
      setIsClientDialogOpen(false);
      resetClientForm();
      loadClients();
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      await deleteClient(clientId.toString());
      toast.success('Cliente excluído com sucesso!');
      loadClients();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    } catch (error) {
      toast.error('Erro ao excluir cliente');
      console.error(error);
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedClient || !currentUser) return;
    
    try {
      setIsSubmitting(true);
      const recordData = {
        ...recordForm,
        clientId: selectedClient.id,
        therapistId: Number(currentUser.id)
      };
      await createMedicalRecord(recordData);
      toast.success('Prontuário criado com sucesso!');
      setIsRecordDialogOpen(false);
      resetRecordForm();
      loadMedicalRecords(selectedClient.id.toString());
    } catch (error) {
      toast.error('Erro ao criar prontuário');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    
    try {
      setIsSubmitting(true);
      await updateMedicalRecord(selectedRecord.id.toString(), recordForm);
      toast.success('Prontuário atualizado com sucesso!');
      setIsRecordDialogOpen(false);
      resetRecordForm();
      if (selectedClient) {
        loadMedicalRecords(selectedClient.id.toString());
      }
    } catch (error) {
      toast.error('Erro ao atualizar prontuário');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Tem certeza que deseja excluir este prontuário?')) return;
    
    try {
      await deleteMedicalRecord(recordId.toString());
      toast.success('Prontuário excluído com sucesso!');
      if (selectedClient) {
        loadMedicalRecords(selectedClient.id.toString());
      }
    } catch (error) {
      toast.error('Erro ao excluir prontuário');
      console.error(error);
    }
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      agreement: '',
      therapists: [] // Resetar os terapeutas
    });
    setIsEditingClient(false);
    setSelectedClient(null);
  };

  const resetRecordForm = () => {
    setRecordForm({
      clientId: 0,
      therapistId: 0,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: 'INDIVIDUAL',
      sessionDuration: 50,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      notes: '',
      nextSessionDate: '',
      bookingId: undefined,
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      agreement: ''
    });
    setIsEditingRecord(false);
    setSelectedRecord(null);
  };

  const openClientDialog = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setClientForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        birthDate: client.birthDate,
        address: client.address,
        emergencyContact: client.emergencyContact,
        emergencyPhone: client.emergencyPhone,
        medicalHistory: client.medicalHistory,
        currentMedications: client.currentMedications,
        allergies: client.allergies,
        motherName: client.motherName,
        motherPhone: client.motherPhone,
        motherEmail: client.motherEmail,
        fatherName: client.fatherName,
        fatherPhone: client.fatherPhone,
        fatherEmail: client.fatherEmail,
        agreement: client.agreement,
        therapists: client.therapists || [] // Carregar os terapeutas do cliente existente
      });
      setIsEditingClient(true);
    } else {
      resetClientForm();
    }
    setIsClientDialogOpen(true);
  };

  const openRecordDialog = (record?: MedicalRecord, bookingId?: number) => {
    if (record) {
      setSelectedRecord(record);
      setRecordForm({
        clientId: record.clientId,
        therapistId: record.therapistId,
        sessionDate: record.sessionDate,
        sessionType: record.sessionType,
        sessionDuration: record.sessionDuration,
        subjective: record.subjective,
        objective: record.objective,
        assessment: record.assessment,
        plan: record.plan,
        notes: record.notes,
        nextSessionDate: record.nextSessionDate || '',
        bookingId: record.bookingId,
        motherName: record.motherName,
        motherPhone: record.motherPhone,
        motherEmail: record.motherEmail,
        fatherName: record.fatherName,
        fatherPhone: record.fatherPhone,
        fatherEmail: record.fatherEmail,
        agreement: record.agreement
      });
      setIsEditingRecord(true);
    } else {
      resetRecordForm();
      if (bookingId) {
        setRecordForm(prev => ({ ...prev, bookingId }));
      }
    }
    setIsRecordDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      'INDIVIDUAL': 'Individual',
      'GROUP': 'Grupo',
      'FAMILY': 'Familiar'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Componentes de Skeleton
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
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MedicalRecordSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
  };



  const generateAccountsAfterClientSaved = async () => {
    try {
      // Buscar o cliente recém-criado ou usar o selecionado
      const currentClient = selectedClient || clients.find(c => c.email === clientForm.email);
      
      if (!currentClient) {
        toast.error('Cliente não encontrado. Tente novamente.');
        return;
      }

      const requestData: CreateParentAccountsRequest = {
        clientId: currentClient.id,
        motherName: clientForm.motherName || undefined,
        motherEmail: clientForm.motherEmail || undefined,
        motherPhone: clientForm.motherPhone || undefined,
        fatherName: clientForm.fatherName || undefined,
        fatherEmail: clientForm.fatherEmail || undefined,
        fatherPhone: clientForm.fatherPhone || undefined,
      };

      const response = await guardiansService.generateParentAccounts(requestData);
      
      toast.success(`Contas criadas com sucesso! ${response.generatedAccounts.length} pai(s) agora têm acesso ao GuardianPortal.`);
      
      // Recarregar a lista de clientes para mostrar os pais vinculados
      loadClients();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar contas de pais';
      toast.error(errorMessage);
      console.error('Erro:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Clientes e Prontuários</h1>
        <Button onClick={() => openClientDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="records" disabled={!selectedClient}>
            Prontuários {selectedClient && `(${selectedClient.name})`}
          </TabsTrigger>
          <TabsTrigger value="bookings" disabled={!selectedClient}>
            Agendamentos {selectedClient && `(${selectedClient.name})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {isLoadingClients ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <ClientSkeleton key={index} />
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedClient?.id === client.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openClientDialog(client);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>Nascimento: {formatDate(client.birthDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{client.address}</span>
                      </div>
                    </div>
                    {(client.motherName || client.fatherName || client.agreement) && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {client.agreement && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Convênio: {client.agreement}
                              </Badge>
                            </div>
                          )}
                          {client.motherName && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs">Mãe: {client.motherName}</span>
                              {client.motherPhone && <span className="text-xs">({client.motherPhone})</span>}
                            </div>
                          )}
                          {client.fatherName && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-xs">Pai: {client.fatherName}</span>
                              {client.fatherPhone && <span className="text-xs">({client.fatherPhone})</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {selectedClient && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">Prontuários de {selectedClient.name}</h3>
                  <p className="text-muted-foreground">
                    Histórico completo de sessões e evoluções
                  </p>
                </div>
                <Button onClick={() => openRecordDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Sessão
                </Button>
              </div>

                             <div className="grid gap-4">
                 {isLoadingRecords ? (
                   <div className="space-y-4">
                     {[...Array(3)].map((_, index) => (
                       <MedicalRecordSkeleton key={index} />
                     ))}
                   </div>
                 ) : medicalRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum prontuário encontrado para este cliente
                  </div>
                ) : (
                  medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                  Sessão {formatDate(record.sessionDate)}
                                </CardTitle>
                                <Badge variant="secondary">
                                  {getSessionTypeLabel(record.sessionType)}
                                </Badge>
                                <Badge variant="outline">
                                  {record.sessionDuration} min
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Criado em {formatDate(record.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRecordDialog(record)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Queixa Principal
                            </Label>
                            <p className="text-sm mt-1">{record.subjective}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Observações Objetivas
                            </Label>
                            <p className="text-sm mt-1">{record.objective}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Avaliação
                            </Label>
                            <p className="text-sm mt-1">{record.assessment}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Plano Terapêutico
                            </Label>
                            <p className="text-sm mt-1">{record.plan}</p>
                          </div>
                        </div>
                        {record.notes && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Observações Adicionais
                            </Label>
                            <p className="text-sm mt-1">{record.notes}</p>
                          </div>
                        )}
                        {record.nextSessionDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Próxima sessão: {formatDate(record.nextSessionDate)}</span>
                          </div>
                        )}
                        
                        {/* Informações dos Pais e Convênio */}
                        {(record.motherName || record.fatherName || record.agreement) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {record.agreement && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Convênio: {record.agreement}
                                  </Badge>
                                </div>
                              )}
                              {record.motherName && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="text-xs">Mãe: {record.motherName}</span>
                                  {record.motherPhone && <span className="text-xs">({record.motherPhone})</span>}
                                </div>
                              )}
                              {record.fatherName && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="text-xs">Pai: {record.fatherName}</span>
                                  {record.fatherPhone && <span className="text-xs">({record.fatherPhone})</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {selectedClient && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">Agendamentos de {selectedClient.name}</h3>
                  <p className="text-muted-foreground">
                    Histórico de sessões agendadas e realizadas
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {clientBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado para este cliente
                  </div>
                ) : (
                  clientBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                  {booking.title}
                                </CardTitle>
                                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                  {booking.status === 'CONFIRMED' ? 'Confirmado' : 
                                   booking.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(booking.start)} - {new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {new Date(booking.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Sala: {booking.room?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!booking.medicalRecord && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRecordDialog(undefined, booking.id)}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Criar Prontuário
                              </Button>
                            )}
                            {booking.medicalRecord && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRecordDialog(booking.medicalRecord)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Ver Prontuário
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {booking.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            {booking.description}
                          </p>
                        </CardContent>
                      )}
                      
                      {/* Informações do Cliente */}
                      {selectedClient && (
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            {selectedClient.agreement && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Convênio: {selectedClient.agreement}
                                </Badge>
                              </div>
                            )}
                            {selectedClient.motherName && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-xs">Mãe: {selectedClient.motherName}</span>
                                {selectedClient.motherPhone && <span className="text-xs">({selectedClient.motherPhone})</span>}
                              </div>
                            )}
                            {selectedClient.fatherName && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-xs">Pai: {selectedClient.fatherName}</span>
                                {selectedClient.fatherPhone && <span className="text-xs">({selectedClient.fatherPhone})</span>}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para Cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="client-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="client-info">Informações do Cliente</TabsTrigger>
              <TabsTrigger value="parents-info">Informações dos Pais</TabsTrigger>
              <TabsTrigger value="guardian-login">Login dos Pais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="client-info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={clientForm.birthDate}
                  onChange={(e) => setClientForm({ ...clientForm, birthDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contato de Emergência *</Label>
                <Input
                  id="emergencyContact"
                  value={clientForm.emergencyContact}
                  onChange={(e) => setClientForm({ ...clientForm, emergencyContact: e.target.value })}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Telefone de Emergência *</Label>
                <Input
                  id="emergencyPhone"
                  value={clientForm.emergencyPhone}
                  onChange={(e) => setClientForm({ ...clientForm, emergencyPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="medicalHistory">Histórico Médico</Label>
              <Textarea
                id="medicalHistory"
                value={clientForm.medicalHistory}
                onChange={(e) => setClientForm({ ...clientForm, medicalHistory: e.target.value })}
                placeholder="Histórico médico relevante"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentMedications">Medicamentos Atuais</Label>
                <Textarea
                  id="currentMedications"
                  value={clientForm.currentMedications}
                  onChange={(e) => setClientForm({ ...clientForm, currentMedications: e.target.value })}
                  placeholder="Medicamentos em uso"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={clientForm.allergies}
                  onChange={(e) => setClientForm({ ...clientForm, allergies: e.target.value })}
                  placeholder="Alergias conhecidas"
                  rows={2}
                />
              </div>
            </div>
            </TabsContent>
            
            <TabsContent value="parents-info" className="space-y-4">
            {/* Seção de Informações dos Pais */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Informações dos Pais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motherName">Nome da Mãe</Label>
                  <Input
                    id="motherName"
                    value={clientForm.motherName}
                    onChange={(e) => setClientForm({ ...clientForm, motherName: e.target.value })}
                    placeholder="Nome completo da mãe"
                  />
                </div>
                <div>
                  <Label htmlFor="motherPhone">Telefone da Mãe</Label>
                  <Input
                    id="motherPhone"
                    value={clientForm.motherPhone}
                    onChange={(e) => setClientForm({ ...clientForm, motherPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="motherEmail">E-mail da Mãe</Label>
                <Input
                  id="motherEmail"
                  type="email"
                  value={clientForm.motherEmail}
                  onChange={(e) => setClientForm({ ...clientForm, motherEmail: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="fatherName">Nome do Pai</Label>
                  <Input
                    id="fatherName"
                    value={clientForm.fatherName}
                    onChange={(e) => setClientForm({ ...clientForm, fatherName: e.target.value })}
                    placeholder="Nome completo do pai"
                  />
                </div>
                <div>
                  <Label htmlFor="fatherPhone">Telefone do Pai</Label>
                  <Input
                    id="fatherPhone"
                    value={clientForm.fatherPhone}
                    onChange={(e) => setClientForm({ ...clientForm, fatherPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="fatherEmail">E-mail do Pai</Label>
                <Input
                  id="fatherEmail"
                  type="email"
                  value={clientForm.fatherEmail}
                  onChange={(e) => setClientForm({ ...clientForm, fatherEmail: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            {/* Seção de Convênio */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Convênio</h3>
              <div>
                <Label htmlFor="agreement">Convênio</Label>
                <Input
                  id="agreement"
                  value={clientForm.agreement}
                  onChange={(e) => setClientForm({ ...clientForm, agreement: e.target.value })}
                  placeholder="Nome do convênio ou particular"
                />
              </div>
            </div>
            </TabsContent>
            
            <TabsContent value="guardian-login" className="space-y-4">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Portal dos Pais</h3>
                  <p className="text-blue-800 text-sm">
                    Gere credenciais de acesso para os pais acompanharem o progresso do tratamento 
                    através do GuardianPortal.
                  </p>
                </div>
                
                {/* Formulário para Mãe */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Acesso da Mãe
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="motherUsername">Nome de usuário</Label>
                      <Input
                        id="motherUsername"
                        value={clientForm.motherName ? `${clientForm.motherName.toLowerCase().replace(/\s+/g, '.')}.mae` : ''}
                        placeholder="gerado automaticamente"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherPassword">Senha</Label>
                      <div className="flex gap-2">
                        <Input
                          id="motherPassword"
                          type="text"
                          value={generatePassword()}
                          placeholder="Senha gerada"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('motherPassword')?.setAttribute('value', generatePassword())}
                        >
                          🔄
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="motherEmailLogin">E-mail para login</Label>
                    <Input
                      id="motherEmailLogin"
                      type="email"
                      value={clientForm.motherEmail}
                      onChange={(e) => setClientForm({ ...clientForm, motherEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                {/* Formulário para Pai */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Acesso do Pai
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fatherUsername">Nome de usuário</Label>
                      <Input
                        id="fatherUsername"
                        value={clientForm.fatherName ? `${clientForm.fatherName.toLowerCase().replace(/\s+/g, '.')}.pai` : ''}
                        placeholder="gerado automaticamente"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherPassword">Senha</Label>
                      <div className="flex gap-2">
                        <Input
                          id="fatherPassword"
                          type="text"
                          value={generatePassword()}
                          placeholder="Senha gerada"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('fatherPassword')?.setAttribute('value', generatePassword())}
                        >
                          🔄
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label htmlFor="fatherEmailLogin">E-mail para login</Label>
                    <Input
                      id="fatherEmailLogin"
                      type="email"
                      value={clientForm.fatherEmail}
                      onChange={(e) => setClientForm({ ...clientForm, fatherEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                {/* Botões de ação */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsClientDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={isEditingClient ? handleUpdateClient : handleCreateClient}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (isEditingClient ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog para Prontuário */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingRecord ? 'Editar Prontuário' : 'Nova Sessão'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sessionDate">Data da Sessão *</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={recordForm.sessionDate}
                  onChange={(e) => setRecordForm({ ...recordForm, sessionDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sessionType">Tipo de Sessão *</Label>
                <Select
                  value={recordForm.sessionType}
                  onValueChange={(value: 'INDIVIDUAL' | 'GROUP' | 'FAMILY') => 
                    setRecordForm({ ...recordForm, sessionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="GROUP">Grupo</SelectItem>
                    <SelectItem value="FAMILY">Familiar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sessionDuration">Duração (min) *</Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  value={recordForm.sessionDuration}
                  onChange={(e) => setRecordForm({ ...recordForm, sessionDuration: parseInt(e.target.value) })}
                  min="15"
                  max="180"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subjective">Queixa Principal *</Label>
              <Textarea
                id="subjective"
                value={recordForm.subjective}
                onChange={(e) => setRecordForm({ ...recordForm, subjective: e.target.value })}
                placeholder="Descreva a queixa principal do cliente"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="objective">Observações Objetivas *</Label>
              <Textarea
                id="objective"
                value={recordForm.objective}
                onChange={(e) => setRecordForm({ ...recordForm, objective: e.target.value })}
                placeholder="Observações objetivas durante a sessão"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="assessment">Avaliação *</Label>
              <Textarea
                id="assessment"
                value={recordForm.assessment}
                onChange={(e) => setRecordForm({ ...recordForm, assessment: e.target.value })}
                placeholder="Avaliação clínica e hipóteses diagnósticas"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="plan">Plano Terapêutico *</Label>
              <Textarea
                id="plan"
                value={recordForm.plan}
                onChange={(e) => setRecordForm({ ...recordForm, plan: e.target.value })}
                placeholder="Plano de intervenção e objetivos terapêuticos"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações Adicionais</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                placeholder="Observações adicionais relevantes"
                rows={2}
              />
            </div>
                         <div>
               <Label htmlFor="nextSessionDate">Próxima Sessão</Label>
               <Input
                 id="nextSessionDate"
                 type="date"
                 value={recordForm.nextSessionDate}
                 onChange={(e) => setRecordForm({ ...recordForm, nextSessionDate: e.target.value })}
               />
             </div>
                         {recordForm.bookingId && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Vinculado ao agendamento:</strong> Este prontuário será criado em conjunto com o agendamento selecionado.
                </p>
              </div>
            )}
            
            {/* Seção de Informações dos Pais e Convênio */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Informações dos Pais e Convênio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recordMotherName">Nome da Mãe</Label>
                  <Input
                    id="recordMotherName"
                    value={recordForm.motherName}
                    onChange={(e) => setRecordForm({ ...recordForm, motherName: e.target.value })}
                    placeholder="Nome completo da mãe"
                  />
                </div>
                <div>
                  <Label htmlFor="recordMotherPhone">Telefone da Mãe</Label>
                  <Input
                    id="recordMotherPhone"
                    value={recordForm.motherPhone}
                    onChange={(e) => setRecordForm({ ...recordForm, motherPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="recordMotherEmail">E-mail da Mãe</Label>
                <Input
                  id="recordMotherEmail"
                  type="email"
                  value={recordForm.motherEmail}
                  onChange={(e) => setRecordForm({ ...recordForm, motherEmail: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="recordFatherName">Nome do Pai</Label>
                  <Input
                    id="recordFatherName"
                    value={recordForm.fatherName}
                    onChange={(e) => setRecordForm({ ...recordForm, fatherName: e.target.value })}
                    placeholder="Nome completo do pai"
                  />
                </div>
                <div>
                  <Label htmlFor="recordFatherPhone">Telefone do Pai</Label>
                  <Input
                    id="recordFatherPhone"
                    value={recordForm.fatherPhone}
                    onChange={(e) => setRecordForm({ ...recordForm, fatherPhone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="recordFatherEmail">E-mail do Pai</Label>
                <Input
                  id="recordFatherEmail"
                  type="email"
                  value={recordForm.fatherEmail}
                  onChange={(e) => setRecordForm({ ...recordForm, fatherEmail: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="recordAgreement">Convênio</Label>
                <Input
                  id="recordAgreement"
                  value={recordForm.agreement}
                  onChange={(e) => setRecordForm({ ...recordForm, agreement: e.target.value })}
                  placeholder="Nome do convênio ou particular"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsRecordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={isEditingRecord ? handleUpdateRecord : handleCreateRecord}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (isEditingRecord ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

