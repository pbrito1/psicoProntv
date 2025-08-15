import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { CalendarIcon, MapPinIcon, UserIcon, PenIcon } from 'lucide-react';

type NavigationProps = {
  currentView: string;
  onViewChange: (viewId: string) => void;
  userRole: 'therapist' | 'admin';
};

export function Navigation({ currentView, onViewChange, userRole = 'therapist' }: NavigationProps) {
  const menuItems = [
    {
      id: 'calendar',
      label: 'Agendamentos',
      icon: CalendarIcon,
      description: 'Visualizar e Gerenciar atendimentos',
      allowedRoles: ['therapist', 'admin']
    },
    {
      id: 'rooms',
      label: 'Gerenciar Salas',
      icon: MapPinIcon,
      description: 'Configurar salas disponíveis',
      allowedRoles: ['admin']
    },
    {
      id: 'userProfile',
      label: 'Perfil do Usuário',
      icon: UserIcon,
      description: 'Ver e editar perfil',
      allowedRoles: ['therapist', 'admin'],
    },
    {
      id: 'prontuario',
      label: 'Prontuário',
      icon: PenIcon,
      description: 'Acessar prontuários dos pacientes',
      allowedRoles: ['therapist', 'admin'],
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-4">
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
          <span className="text-sm text-gray-600">Dr. Ana Silva</span>
          <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
            {userRole === 'admin' ? 'Admin' : 'Terapeuta'}
          </Badge>
        </div>
      </div>

      <nav className="space-y-2">
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
    </div>
  );
}

