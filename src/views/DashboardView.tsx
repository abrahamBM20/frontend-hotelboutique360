import React from 'react';
import type { UserRole } from '../types';

interface DashboardProps {
  userRoles: UserRole[];
}

import ReservationSummaryPanel from '../components/ReservationSummaryPanel';

export const DashboardView: React.FC<DashboardProps> = ({ userRoles }) => {
  const role = userRoles[0] || 'GUEST';

  // 1. ADMIN: métricas globales
  if (role === 'ADMIN') {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ color: '#3b0764', fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0 0 5px 0' }}>
          Panel de Administración
        </h2>
        <p style={{ color: '#6b21a8', marginBottom: '20px' }}>
          Métricas globales e ingresos del Hotel Boutique.
        </p>

        {/* Los datos vienen del BFF -> ms-hotel-rooms -> PostgreSQL */}
        <ReservationSummaryPanel userRoles={userRoles} />
      </div>
    );
  }

  // 2. RECEPCIONISTA: operaciones del día
  if (role === 'RECEPCIONISTA') {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ color: '#3b0764', fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0 0 5px 0' }}>
          Recepción y Operaciones
        </h2>
        <p style={{ color: '#6b21a8', marginBottom: '20px' }}>
          Accesos rápidos para gestión de huéspedes.
        </p>

        <ReservationSummaryPanel userRoles={userRoles} />
      </div>
    );
  }

  // 3. HUESPED: su reserva activa
  if (role === 'HUESPED') {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ color: '#3b0764', fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0 0 20px 0' }}>
          Mi Estancia
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ReservationSummaryPanel userRoles={userRoles} />

          <div className="card" style={{ background: '#faf5ff' }}>
            <h4 style={{ color: '#3b0764', marginTop: 0, marginBottom: '10px' }}>
              ¿Buscas otra experiencia?
            </h4>
            <p style={{ color: '#6b21a8', marginBottom: '20px' }}>
              Explora nuestras habitaciones y reserva tu próxima visita.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. GUEST (Sin Login) - Centrado absoluto y responsivo
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '10% 5%',
      minHeight: '60vh'
    }}>
      <h2 style={{ color: '#3b0764', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 15px 0' }}>
        Hotel Boutique 360
      </h2>
      <p style={{ color: '#6b21a8', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', maxWidth: '600px', lineHeight: 1.6 }}>
        Descubre el confort y la elegancia. Inicia sesión para reservar habitaciones o gestionar tus estancias.
      </p>

      <div className="card" style={{ textAlign: 'left', width: '100%', maxWidth: '400px' }}>
        <h4 style={{ color: '#3b0764', marginTop: 0, marginBottom: '10px' }}>Acceso de Invitado</h4>
        <p style={{ color: '#6b21a8', margin: 0 }}>
          Por favor, utiliza el botón superior de "Login" para ingresar con tu cuenta y acceder a todas las funciones.
        </p>
      </div>
    </div>
  );
};
