import { useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from 'lucide-react';
import { listRooms } from '@/services/rooms';
import { listUsers } from '@/services/users';
import { createBooking, deleteBooking, listBookings } from '@/services/bookings';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


moment.locale('pt-br');
const localizer = momentLocalizer(moment);


type Room = { id: number; name: string; capacity: number; resources?: string[] | null };
type Therapist = { id: number; name?: string | null; email: string };

// interface Room {
//   id: string;
//   name: string;
//   capacity: number;
//   resources: string[];
// }

// interface Therapist {
//   id: string;
//   name: string;
//   role: string;
// }

interface MyEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  roomId: number;
  therapistId: number;
  roomName?: string;
  therapistName?: string;
}

export function CalendarView() {
  const { user: currentUser } = useAuth();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);

  
  const [formRoomId, setFormRoomId] = useState('');
  const [formTherapistId, setFormTherapistId] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formTitle, setFormTitle] = useState('');

  interface SlotInfo {
    start: Date;
    end: Date;
  }

  const handleSelectSlot = ({ start, end }: SlotInfo): void => {
    setSelectedDate(start);
    setFormStartTime(moment(start).format('HH:mm'));
    setFormEndTime(moment(end).format('HH:mm'));
    setIsDialogOpen(true);
  };


  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRoomId || !formTherapistId || !formStartTime || !formEndTime || !formTitle) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de horários
    const startHour = parseInt(formStartTime.split(':')[0]);
    const startMinute = parseInt(formStartTime.split(':')[1]);
    const endHour = parseInt(formEndTime.split(':')[0]);
    const endMinute = parseInt(formEndTime.split(':')[1]);
    
    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
      toast.error('O horário de fim deve ser posterior ao horário de início.');
      return;
    }

    const selectedRoom = rooms.find((room) => room.id === Number(formRoomId));
    const selectedTherapist = therapists.find((t) => t.id === Number(formTherapistId));

    if (!selectedRoom || !selectedTherapist) {
      toast.error('Sala ou terapeuta não encontrado.');
      return;
    }

    const startDateTime = moment(selectedDate)
      .hour(parseInt(formStartTime.split(':')[0]))
      .minute(parseInt(formStartTime.split(':')[1]))
      .toDate();

    const endDateTime = moment(selectedDate)
      .hour(parseInt(formEndTime.split(':')[0]))
      .minute(parseInt(formEndTime.split(':')[1]))
      .toDate();

    // Validação adicional de datas
    if (endDateTime <= startDateTime) {
      toast.error('O horário de fim deve ser posterior ao horário de início.');
      return;
    }

    // Verificar se já existe algum agendamento na mesma sala e horário
    const hasConflict = events.some(event => {
      if (event.roomId !== Number(formRoomId)) return false;
      
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return (
        (startDateTime >= eventStart && startDateTime < eventEnd) ||
        (endDateTime > eventStart && endDateTime <= eventEnd) ||
        (startDateTime <= eventStart && endDateTime >= eventEnd)
      );
    });

    if (hasConflict) {
      toast.error('Já existe um agendamento nessa sala neste horário.');
      return;
    }

    console.log('Dados do agendamento:', {
      title: formTitle,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      roomId: Number(formRoomId),
      therapistId: Number(formTherapistId),
    });

    try {
      const created = await createBooking({
        title: formTitle,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        roomId: Number(formRoomId),
        therapistId: Number(formTherapistId),
      });
      console.log('Agendamento criado:', created);
      
      const newEvent: MyEvent = {
        id: created.id,
        title: created.title,
        start: new Date(created.start),
        end: new Date(created.end),
        roomId: created.roomId,
        therapistId: created.therapistId,
        roomName: selectedRoom?.name ?? '',
        therapistName: selectedTherapist?.name ?? selectedTherapist?.email ?? '',
      };
      // Atualizar a lista de agendamentos automaticamente
      await fetchBookings();
      
      // Notificar o terapeuta sobre o novo agendamento
      const therapistName = selectedTherapist?.name || selectedTherapist?.email;
      const roomName = selectedRoom?.name;
      const timeRange = `${moment(startDateTime).format('HH:mm')} - ${moment(endDateTime).format('HH:mm')}`;
      
      // Verificar se o usuário logado é o terapeuta do agendamento
      const isCurrentUserBooking = currentUser && 
        (currentUser.id === String(selectedTherapist?.id) || 
         (currentUser.role === 'ADMIN' && currentUser.id === String(selectedTherapist?.id)));
      
      if (isCurrentUserBooking) {
        toast.success(`Seu agendamento foi criado com sucesso!`, {
          description: `${formTitle} na ${roomName} das ${timeRange}`,
          duration: 6000,
        });
      } else {
        toast.success(`Agendamento criado com sucesso!`, {
          description: `${therapistName} tem um agendamento na ${roomName} das ${timeRange}`,
          duration: 5000,
        });
      }
      
      setIsDialogOpen(false);
      setFormRoomId('');
      setFormTherapistId('');
      setFormTitle('');
      setFormStartTime('');
      setFormEndTime('');
    } catch (err: any) {
      console.error('Erro completo:', err);
      const msg = err?.response?.data?.message || 'Erro ao criar agendamento';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await deleteBooking(selectedEvent.id);
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setIsViewEventOpen(false);
      setSelectedEvent(null);
      toast.success('Agendamento excluído com sucesso!');
    }
  };

  useEffect(() => {
    (async () => {
      const [roomsData, usersData] = await Promise.all([listRooms(), listUsers()]);
      setRooms(roomsData as any);
      const therapistsOnly = (usersData || []).filter((u) => u.role === 'THERAPIST');
      setTherapists(therapistsOnly as any);
    })();
  }, []);

  // Função para buscar agendamentos
  const fetchBookings = async (showNotifications = false) => {
    try {
      const dateParam = moment(selectedDate).format('DD-MM-YYYY');
      const bookings = await listBookings(dateParam);
      const mapped: MyEvent[] = bookings.map((b: any) => ({
        id: b.id,
        title: b.title,
        start: new Date(b.start),
        end: new Date(b.end),
        roomId: b.roomId,
        therapistId: b.therapistId,
        roomName: b.room?.name,
        therapistName: b.therapist?.name ?? b.therapist?.email,
      }));
      
      // Detectar novos agendamentos se showNotifications for true
      if (showNotifications && events.length > 0) {
        const newBookings = mapped.filter(newEvent => 
          !events.some(oldEvent => oldEvent.id === newEvent.id)
        );
        
        newBookings.forEach(booking => {
          // Verificar se o usuário logado é o terapeuta do agendamento
          const isCurrentUserBooking = currentUser && 
            (currentUser.id === String(booking.therapistId) || 
             (currentUser.role === 'ADMIN' && currentUser.id === String(booking.therapistId)));
          
          if (isCurrentUserBooking) {
            toast.success(`Você tem um novo agendamento!`, {
              description: `${booking.title} na ${booking.roomName} das ${moment(booking.start).format('HH:mm')} às ${moment(booking.end).format('HH:mm')}`,
              duration: 6000,
            });
          } else {
            toast.info(`Novo agendamento: ${booking.title}`, {
              description: `${booking.therapistName} na ${booking.roomName} das ${moment(booking.start).format('HH:mm')} às ${moment(booking.end).format('HH:mm')}`,
              duration: 4000,
            });
          }
        });
      }
      
      setEvents(mapped);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  // Atualizar agendamentos quando a data mudar
  useEffect(() => {
    fetchBookings();
    
    // Mostrar notificação de boas-vindas para terapeutas
    if (currentUser && currentUser.role === 'THERAPIST') {
      toast.info(`Bem-vindo, ${currentUser.name}!`, {
        description: 'Seus agendamentos serão atualizados automaticamente.',
        duration: 3000,
      });
    }
  }, [selectedDate, currentUser]);

  // Atualizar agendamentos automaticamente a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings(true); // Mostrar notificações para novos agendamentos
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [selectedDate]);

  const eventPropGetter = useMemo(
    () => (event: MyEvent) => {
      const colors: Record<string, { backgroundColor: string; borderColor: string }> = {
        '1': { backgroundColor: '#3b82f6', borderColor: '#1d4ed8' },
        '2': { backgroundColor: '#10b981', borderColor: '#047857' },
        '3': { backgroundColor: '#f59e0b', borderColor: '#d97706' },
      };
      
      const color = colors[String(event.therapistId)] || { backgroundColor: '#6b7280', borderColor: '#374151' };
      
      return {
        style: {
          ...color,
          borderRadius: '4px',
          opacity: 0.8,
          color: 'white',
          border: `2px solid ${color.borderColor}`,
          fontSize: '12px',
        },
      };
    },
    []
  );

  const messages = {
    next: 'Próximo',
    previous: 'Anterior',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Nenhum agendamento neste período.',
    showMore: (total: number) => `+ Ver mais (${total})`
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamento de Salas</h1>
          <p className="text-gray-600 mt-1">Gerencie os agendamentos das salas de terapia</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Legenda dos Terapeutas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda dos Terapeutas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {therapists.map((therapist: Therapist, index: number) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
              return (
                <div key={therapist.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors[index]}`}></div>
                  <span className="text-sm font-medium">{therapist.name ?? therapist.email}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="week"
              messages={messages}
              step={30}
              timeslots={2}
              max={new Date(2024, 0, 1, 20, 0)} 
              min={new Date(2024, 0, 1, 7, 0)} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar Agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Novo Agendamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input 
                  id="date" 
                  value={moment(selectedDate).format('DD/MM/YYYY')} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="therapist">Terapeuta</Label>
                <Select value={formTherapistId} onValueChange={setFormTherapistId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {therapists.map((therapist: Therapist) => (
                      <SelectItem key={therapist.id} value={String(therapist.id)}>
                        {therapist.name ?? therapist.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Sala *</Label>
              <Select value={formRoomId} onValueChange={setFormRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sala" />
                </SelectTrigger>
                <SelectContent>
                    {rooms.map((room: Room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      <div className="flex flex-col">
                        <span>{room.name}</span>
                        <span className="text-xs text-gray-500">
                          Capacidade: {room.capacity} | {(room.resources ?? []).join(', ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de Início *</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={formStartTime} 
                  onChange={(e) => setFormStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Fim *</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={formEndTime} 
                  onChange={(e) => setFormEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título do Agendamento *</Label>
              <Input 
                id="title" 
                value={formTitle} 
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Sessão Individual - Paciente João"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Agendamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar/Editar Agendamento */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Título:</span>
                  <span>{selectedEvent.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Data:</span>
                  <span>{moment(selectedEvent.start).format('DD/MM/YYYY')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Horário:</span>
                  <span>
                    {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Sala:</span>
                  <span>{selectedEvent.roomName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Terapeuta:</span>
                  <span>{selectedEvent.therapistName}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewEventOpen(false)}>
                  Fechar
                </Button>
                <Button variant="destructive" onClick={handleDeleteEvent}>
                  Excluir Agendamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

