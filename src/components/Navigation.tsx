import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, MapPinIcon, UserIcon, UsersIcon, LogOutIcon, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ProfileEdit } from './ProfileEdit';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral dos clientes e agendamentos',
      allowedRoles: ['THERAPIST', 'ADMIN']
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: CalendarIcon,
      description: 'Visualizar e gerenciar agendamentos',
      allowedRoles: ['THERAPIST', 'ADMIN']
    },
    {
      id: 'clientManagement',
      label: 'Gestão de Clientes',
      icon: UserIcon,
      description: 'Gerenciar clientes e prontuários',
      allowedRoles: ['THERAPIST', 'ADMIN']
    },
    {
      id: 'rooms',
      label: 'Gerenciar Salas',
      icon: MapPinIcon,
      description: 'Configurar salas disponíveis',
      allowedRoles: ['ADMIN']
    },
    {
      id: 'userManagement',
      label: 'Gerenciar Usuários',
      icon: UsersIcon,
      description: 'Criar e editar usuários do sistema',
      allowedRoles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(user?.role === 'ADMIN' ? 'ADMIN' : 'THERAPIST')
  );

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 h-screen p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            <div className="flex items-center justify-center">
              <img
                src="./src/assets/logo.png"
                alt="Logo PsicoPront"
                className="h-40"
              />
            </div>
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Dr. {user?.name}</span>
              <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                {user?.role === 'ADMIN' ? 'Admin' : 'Terapeuta'}
              </Badge>
            </div>
            
            {/* Ícone de Perfil no Canto Direito */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>
              
              {/* Dropdown do Perfil */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileEdit(true);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutDialog(true);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start h-auto p-3 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70 mt-1">{item.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Botão de Logout */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all duration-200 hover:shadow-sm"
            onClick={handleLogout}
          >
            <div className="flex items-start gap-3">
              <LogOutIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Sair</div>
                <div className="text-xs opacity-70 mt-1">Encerrar sessão</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Dialog de Logout */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600 text-xl">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                Confirmar Logout
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Você está prestes a encerrar sua sessão no sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Usuário Atual:</p>
                    <p className="text-blue-700 font-semibold">Dr. {user?.name}</p>
                    <p className="text-blue-600 text-xs mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-amber-800">Atenção:</p>
                </div>
                <div className="text-sm text-amber-700 space-y-2 ml-8">
                  <p>• Suas alterações não salvas serão perdidas</p>
                  <p>• Você precisará fazer login novamente para acessar o sistema</p>
                  <p>• A sessão será encerrada imediatamente</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={cancelLogout}
                className="px-6 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmLogout}
                className="px-6 bg-red-600 hover:bg-red-700 shadow-sm"
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Confirmar Saída
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal do ProfileEdit */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <ProfileEdit />
        </DialogContent>
      </Dialog>
    </>
  );
}

