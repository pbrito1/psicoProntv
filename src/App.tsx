import { CalendarView } from './components/CalendarView'
import { RoomView } from './components/RoomView'
import { UserManagement } from './components/UserManagement'
import { ClientManagement } from './components/ClientManagement'
import { TherapistDashboard } from './components/TherapistDashboard'
import { GuardianPortal } from './components/GuardianPortal'
import { GuardianLoginPage } from './components/GuardianLoginPage'
import { GuardianProfile } from './components/GuardianProfile'
import { Layout } from './components/Layout'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/guardian-login" element={<GuardianLoginPage />} />
        
        {/* Rotas para terapeutas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<TherapistDashboard />} />
            <Route path="/dashboard" element={<TherapistDashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/rooms" element={<RoomView />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/clients" element={<ClientManagement />} />
          </Route>
        </Route>
        
        {/* Rotas para pais */}
        <Route path="/guardian" element={<GuardianPortal />} />
        <Route path="/guardian/profile" element={<GuardianProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
  