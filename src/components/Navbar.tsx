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
    <header className="top-navbar">
      <div className="brand-lockup">
        <Hotel color="#bd06d9" size={28} />
        <span className="brand-name">
          HOTEL BOUTIQUE <span style={{ color: '#bd06d9' }}>360</span>
        </span>
      </div>

      <div className="account-area">
        {auth.isAuthenticated ? (
          <>
            <div className="account-summary">
              <User size={18} color="#d97706" />
              <span className="account-email">{auth.user?.profile.email}</span>
              <span className="badge badge-warning">{userRoles[0] || 'HUESPED'}</span>
            </div>
            <button 
              onClick={() => void auth.removeUser()} 
              className="logout-button"
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