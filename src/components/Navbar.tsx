import React from 'react';
import { useAuth } from 'react-oidc-context';
import { LogIn, LogOut, Hotel, User } from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  userRoles: UserRole[];
}

export const Navbar: React.FC<NavbarProps> = ({ userRoles }) => {
  const auth = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#2b153d',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Hotel color="#bd06d9" size={28} />
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          HOTEL BOUTIQUE <span style={{ color: '#bd06d9' }}>360</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {auth.isAuthenticated ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#d97706" />
              <span style={{ fontSize: '0.9rem' }}>{auth.user?.profile.email}</span>
              <span className="badge badge-warning">{userRoles[0] || 'HUESPED'}</span>
            </div>
            <button 
              onClick={() => void auth.removeUser()} 
              style={{ background: 'transparent', border: '1px solid #d97706', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={16} /> Salir
            </button>
          </>
        ) : (
          <button 
            onClick={() => void auth.signinRedirect()} 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogIn size={18} /> Iniciar Sesión (Cognito)
          </button>
        )}
      </div>
    </header>
  );
};