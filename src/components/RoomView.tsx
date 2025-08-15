import { useEffect, useState, type ChangeEvent, type FormEvent, type JSX } from 'react';
import { listRooms, createRoom as apiCreateRoom, updateRoom as apiUpdateRoom, deleteRoom as apiDeleteRoom, type RoomDto } from '@/services/rooms';

type Room = RoomDto;

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, MapPinIcon, UsersIcon, SettingsIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RoomView(): JSX.Element {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  
  const [formName, setFormName] = useState<string>('');
  const [formCapacity, setFormCapacity] = useState<string>('');
  const [formResources, setFormResources] = useState<string>('');
  const [formOpeningTime, setFormOpeningTime] = useState<string>('08:00');
  const [formClosingTime, setFormClosingTime] = useState<string>('18:00');
  const [formDescription, setFormDescription] = useState<string>('');

  const resetForm = (): void => {
    setFormName('');
    setFormCapacity('');
    setFormResources('');
    setFormOpeningTime('08:00');
    setFormClosingTime('18:00');
    setFormDescription('');
  };

  useEffect(() => {
    (async () => {
      const data = await listRooms();
      setRooms(
        data.map((r: RoomDto) => ({
          ...r,
          resources: Array.isArray(r.resources) ? r.resources : [],
          openingTime: r.openingTime ?? '',
          closingTime: r.closingTime ?? '',
          description: r.description ?? '',
        })),
      );
    })();
  }, []);

  const handleAddRoom = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formName || !formCapacity) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    const payload = {
      name: formName,
      capacity: parseInt(formCapacity),
      resources: formResources
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r),
      openingTime: formOpeningTime,
      closingTime: formClosingTime,
      description: formDescription,
    } as Omit<RoomDto, 'id'>;
    const created = await apiCreateRoom(payload);
    setRooms([...rooms, { ...created, resources: (created.resources as string[]) ?? [] }]);
    setIsAddDialogOpen(false);
    resetForm();
    alert('Sala criada com sucesso!');
  };

  const handleEditRoom = (room: Room): void => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormCapacity(room.capacity.toString());
    setFormResources(room.resources?.join(', ') ?? '');
    setFormOpeningTime(room.openingTime ?? '');
    setFormClosingTime(room.closingTime ?? '');
    setFormDescription(room.description ?? '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateRoom = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formName || !formCapacity) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    if (!editingRoom) return;
    const payload = {
      name: formName,
      capacity: parseInt(formCapacity),
      resources: formResources
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r),
      openingTime: formOpeningTime,
      closingTime: formClosingTime,
      description: formDescription,
    } as Partial<Omit<RoomDto, 'id'>>;
    const updated = await apiUpdateRoom(editingRoom.id, payload);
    setRooms(
      rooms.map((room) => (room.id === editingRoom.id ? { ...updated, resources: (updated.resources as string[]) ?? [] } : room)),
    );
    setIsEditDialogOpen(false);
    setEditingRoom(null);
    resetForm();
    alert('Sala atualizada com sucesso!');
  };

  const handleDeleteRoom = async (roomId: number): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.')) {
      await apiDeleteRoom(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
      alert('Sala excluída com sucesso!');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Salas</h1>
          <p className="text-gray-600 mt-1">Configure e gerencie as salas disponíveis para agendamento</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nova Sala
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Salas</CardTitle>
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Salas cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((total, room) => total + room.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pessoas que podem ser atendidas simultaneamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salas Ativas</CardTitle>
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Salas disponíveis para agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Salas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Salas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as salas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Sala</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Recursos</TableHead>
                <TableHead>Horário de Funcionamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room: Room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{room.name}</div>
                      {room.description && (
                        <div className="text-sm text-gray-500 mt-1">{room.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <UsersIcon className="h-3 w-3" />
                      {room.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.resources?.slice(0, 2).map((resource: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                      {room.resources?.length && room.resources.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.resources.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {room.openingTime} - {room.closingTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRoom(room)}
                        className="flex items-center gap-1"
                      >
                        <EditIcon className="h-3 w-3" />
                        Editar
                      </Button>
                       <Button
                        variant="destructive"
                        size="sm"
                         onClick={() => handleDeleteRoom(room.id)}
                        className="flex items-center gap-1"
                      >
                        <TrashIcon className="h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para Adicionar Sala */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Adicionar Nova Sala
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Sala *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                  placeholder="Ex: Sala de Terapia Individual A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formCapacity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCapacity(e.target.value)}
                  placeholder="Ex: 2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resources">Recursos (separados por vírgula)</Label>
              <Textarea
                id="resources"
                value={formResources}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormResources(e.target.value)}
                placeholder="Ex: Ar condicionado, Sofá confortável, Mesa auxiliar"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Horário de Abertura</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={formOpeningTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormOpeningTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime">Horário de Fechamento</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={formClosingTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClosingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="Descrição opcional da sala..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Sala
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Sala */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EditIcon className="h-5 w-5" />
              Editar Sala
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Sala *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                  placeholder="Ex: Sala de Terapia Individual A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacidade *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={formCapacity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormCapacity(e.target.value)}
                  placeholder="Ex: 2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-resources">Recursos (separados por vírgula)</Label>
              <Textarea
                id="edit-resources"
                value={formResources}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormResources(e.target.value)}
                placeholder="Ex: Ar condicionado, Sofá confortável, Mesa auxiliar"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-openingTime">Horário de Abertura</Label>
                <Input
                  id="edit-openingTime"
                  type="time"
                  value={formOpeningTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormOpeningTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-closingTime">Horário de Fechamento</Label>
                <Input
                  id="edit-closingTime"
                  type="time"
                  value={formClosingTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormClosingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="Descrição opcional da sala..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}