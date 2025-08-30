import { useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { RoomView } from './components/RoomView'
import { Navigation } from './components/Navigation'
import { UserProfile } from './components/UserProfile'
import { UserManagement } from './components/UserManagement'
import { ClientManagement } from './components/ClientManagement'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';

function App() {
  const [currentView, setCurrentView] = useState('calendar')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />
      case 'rooms':
        return <RoomView />
      case 'userProfile':
        return <UserProfile />
      case 'userManagement':
        return <UserManagement />
      case 'clients':
        return <ClientManagement />
      default:
        return <CalendarView />
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
                {/*   <div className="fixed bottom-4 right-4">
                  <div className="bg-white rounded-lg shadow-lg p-3 border">
                    <div className="text-xs text-gray-600 mb-2">Demonstração - Alternar Perfil:</div> */}
                    {/* <div className="flex gap-2">
                      <button
                        onClick={() => setUserRole('therapist')}
                        className={`px-3 py-1 text-xs rounded ${
                          userRole === 'therapist' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Terapeuta
                      </button>
                      <button
                        onClick={() => setUserRole('admin')}
                        className={`px-3 py-1 text-xs rounded ${
                          userRole === 'admin' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div> */}
                {/* </div> */}
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
  