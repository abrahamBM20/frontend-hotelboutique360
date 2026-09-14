import React from 'react';
import { LayoutDashboard, BedDouble, CalendarCheck, BarChart3, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRoles: UserRole[];
  isOpen: boolean;               // NUEVO: Estado para saber si está abierto
  setIsOpen: (val: boolean) => void; // NUEVO: Función para cerrarlo
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, userRoles, isOpen, setIsOpen }) => {
  const isAdmin = userRoles.includes('ADMIN');
  const isStaff = userRoles.includes('ADMIN') || userRoles.includes('RECEPCIONISTA');

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'rooms', label: 'Habitaciones', icon: BedDouble, show: true },
    { id: 'reservations', label: 'Reservas', icon: CalendarCheck, show: isStaff }, 
    { id: 'reports', label: 'Reportes KPIs', icon: BarChart3, show: isAdmin },
  ];

  return (
    <>
      {/* OVERLAY: Fondo oscuro que aparece cuando el menú está abierto */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40, backdropFilter: 'blur(2px)',
            transition: 'opacity 0.3s'
          }}
        />
      )}

      {/* MENÚ LATERAL FLOTANTE */}
      <aside style={{ 
        position: 'fixed',
        top: 0,
        left: isOpen ? '0' : '-300px', /* Aquí ocurre la magia de ocultarlo/mostrarlo */
        width: '260px',
        height: '100vh',
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #f3e8ff', 
        padding: '20px',
        transition: 'left 0.3s ease-in-out',
        zIndex: 50,
        boxShadow: isOpen ? '4px 0 15px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabecera del Menú con Botón de Cerrar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#3b0764', margin: 0, fontSize: '1.2rem' }}>Menú</h2>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b21a8', padding: '5px' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false); // Cierra el menú automáticamente al elegir una opción
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '8px', border: 'none',
                  backgroundColor: isActive ? '#f3e8ff' : 'transparent',
                  color: isActive ? '#7c3aed' : '#6b21a8',
                  fontWeight: isActive ? '600' : 'normal',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
              >
                <Icon size={20} color={isActive ? '#7c3aed' : '#a855f7'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};