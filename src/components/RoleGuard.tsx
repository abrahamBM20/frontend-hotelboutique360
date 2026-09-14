import React from 'react';
import type { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  userRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, userRoles, children }) => {
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: '#ef4444' }}>Acceso Restringido (403 Forbidden)</h3>
        <p>No posees los permisos (claims) requeridos en Cognito para consultar esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
};