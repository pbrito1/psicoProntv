import { useAuth } from '@/contexts/AuthContext';
import { ProfileEdit } from './ProfileEdit';

export function UserProfile() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Carregando...</div>;
  }

  return <ProfileEdit />;
}