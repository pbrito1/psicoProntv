import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { CalendarIcon, MapPinIcon, UserIcon, PenIcon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type NavigationProps = {
  currentView: string;
  onViewChange: (viewId: string) => void;
};

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth();
  const menuItems = [
    {
      id: 'calendar',
      label: 'Agendamentos',
      icon: CalendarIcon,
      description: 'Visualizar e Gerenciar atendimentos',
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
    },
    {
      id: 'userProfile',
      label: 'Perfil do Usuário',
      icon: UserIcon,
      description: 'Ver e editar perfil',
      allowedRoles: ['THERAPIST', 'ADMIN'],
    },
    {
      id: 'prontuario',
      label: 'Prontuário',
      icon: PenIcon,
      description: 'Acessar prontuários dos pacientes',
      allowedRoles: ['THERAPIST', 'ADMIN'],
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(user?.role === 'ADMIN' ? 'ADMIN' : 'THERAPIST')
  );

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-4 flex flex-col">
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
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Dr. {user?.name}</span>
          <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
            {user?.role === 'ADMIN' ? 'Admin' : 'Terapeuta'}
          </Badge>
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
          className="w-full justify-start h-auto p-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
    </div>
  );
}

