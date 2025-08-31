import { useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { RoomView } from './components/RoomView'
import { Navigation } from './components/Navigation'
import { UserManagement } from './components/UserManagement'
import { ClientManagement } from './components/ClientManagement'
import { TherapistDashboard } from './components/TherapistDashboard'
import { GuardianPortal } from './components/GuardianPortal'
import { GuardianLoginPage } from './components/GuardianLoginPage'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <TherapistDashboard />
      case 'calendar':
        return <CalendarView />
      case 'rooms':
        return <RoomView />
      case 'userManagement':
        return <UserManagement />
      case 'clientManagement':
        return <ClientManagement />
      default:
        return <TherapistDashboard />
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/guardian-login" element={<GuardianLoginPage />} />
        
        {/* Rotas para terapeutas */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <div className="flex h-screen bg-gray-50">
                <Navigation 
                  currentView={currentView} 
                  onViewChange={setCurrentView}
                />
                <main className="flex-1 overflow-auto">
                  {renderCurrentView()}
                </main>
              </div>
            }
          />
        </Route>
        
        {/* Rotas para pais */}
        <Route path="/guardian" element={<GuardianPortal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
  