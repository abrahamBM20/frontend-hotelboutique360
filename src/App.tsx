import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from 'react-oidc-context';
import axiosInstance from './api/axiosInstance';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RoleGuard } from './components/RoleGuard';
import { getUserRolesFromToken } from './utils/authUtils';
import type { UserRole } from './types';
import { Menu } from 'lucide-react';

import { DashboardView } from './views/DashboardView';
import { RoomsView } from './views/RoomsView';
import { ReservationsView } from './views/ReservationsView';
import { ReportsView } from './views/Reportsview';

export const App: React.FC = () => {
  const auth = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [healthResponse, setHealthResponse] = useState<string>('');
  const [healthLoading, setHealthLoading] = useState(false);

  const userRoles: UserRole[] = auth.isAuthenticated
    ? getUserRolesFromToken(auth.user?.id_token)
    : ['GUEST'];

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthResponse('');
    try {
      const response = await axiosInstance.get('/health');
      setHealthResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (isAxiosError(error)) {
        setHealthResponse(`HTTP ${error.response?.status ?? 'sin respuesta'}: ${error.response?.data ?? error.message}`);
      } else {
        setHealthResponse(`Error de red: ${error instanceof Error ? error.message : 'desconocido'}`);
      }
    } finally {
      setHealthLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView userRoles={userRoles} />;
      case 'rooms':
        return <RoomsView userRoles={userRoles} />;
      case 'reservations':
        return <ReservationsView />;
      case 'reports':
        return (
          <RoleGuard allowedRoles={['ADMIN']} userRoles={userRoles}>
            <ReportsView />
          </RoleGuard>
        );
      default:
        return <DashboardView userRoles={userRoles} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      
      <Navbar userRoles={userRoles} />

      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Abrir menú"
        style={{ position: 'fixed', top: '76px', left: '20px', zIndex: 20 }}
      >
        <Menu size={22} />
      </button>

      {/* SIDEBAR OCULTO */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        userRoles={userRoles} 
        isOpen={isSidebarOpen}          // Pasamos el estado
        setIsOpen={setIsSidebarOpen}    // Pasamos la función para cerrar
      />

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {auth.isLoading && <p>Cargando sesión de Cognito...</p>}
          {auth.error && <p>Error de Cognito: {auth.error.message}</p>}
          {auth.isAuthenticated && (
            <section className="card" style={{ marginBottom: '20px' }}>
              <h2>Prueba de conexión</h2>
              <p>Sesión activa: {auth.user?.profile.email ?? 'usuario autenticado'}</p>
              <button className="btn-primary" onClick={() => void checkHealth()} disabled={healthLoading}>
                {healthLoading ? 'Consultando...' : 'Consultar API health'}
              </button>
              {healthResponse && <pre style={{ whiteSpace: 'pre-wrap' }}>{healthResponse}</pre>}
            </section>
          )}
          {renderView()}
        </div>
      </main>

    </div>
  );
};

export default App;