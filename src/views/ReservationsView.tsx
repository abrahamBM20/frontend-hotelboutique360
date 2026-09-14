import React, { useState } from 'react';
import type { Reservation } from '../types';

export const ReservationsView: React.FC = () => {
  // 1. Estado local de Reservas (Mock de Base de Datos)
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 'RES-1001', guestName: 'Carlos Mendoza', roomNumber: '101', checkIn: '2026-09-12', status: 'CONFIRMADA' },
    { id: 'RES-1002', guestName: 'Laura Silva', roomNumber: '102', checkIn: '2026-09-13', status: 'PENDIENTE' },
    { id: 'RES-1003', guestName: 'Roberto Gómez', roomNumber: '205', checkIn: '2026-09-10', status: 'CHECKED_IN' },
  ]);

  // 2. Estados para el Modal de nueva reserva
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Reservation>>({});

  // 3. Funciones para manejar estados rápidos (Check-In / Check-Out)
  const changeReservationStatus = (id: string, newStatus: Reservation['status']) => {
    setReservations((prev) => 
      prev.map((res) => res.id === id ? { ...res, status: newStatus } : res)
    );
  };

  // 4. Funciones del Formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReservation: Reservation = {
      id: `RES-${Math.floor(Math.random() * 9000) + 1000}`, // Genera un ID aleatorio tipo RES-8452
      guestName: formData.guestName || 'Sin Nombre',
      roomNumber: formData.roomNumber || '000',
      checkIn: formData.checkIn || new Date().toISOString().split('T')[0],
      status: 'PENDIENTE'
    };
    setReservations((prev) => [newReservation, ...prev]);
    setIsModalOpen(false);
    setFormData({});
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMADA': return <span className="badge badge-success">Confirmada</span>;
      case 'PENDIENTE': return <span className="badge badge-warning">Pendiente</span>;
      case 'CHECKED_IN': return <span className="badge" style={{ background: '#3b0764', color: 'white' }}>En Habitación</span>;
      case 'CHECKED_OUT': return <span className="badge" style={{ background: '#e2e8f0', color: '#475569' }}>Finalizada</span>;
      case 'CANCELADA': return <span className="badge" style={{ background: '#fee2e2', color: '#ef4444' }}>Cancelada</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#3b0764', margin: 0 }}>Gestión de Reservas</h2>
          <p style={{ color: '#6b21a8', marginTop: '5px' }}>Control de ingresos y salidas del día.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Nueva Reserva</button>
      </div>

      {/* Tabla de Reservas */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table-custom">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Check-In</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td style={{ fontWeight: 'bold', color: '#3b0764' }}>{res.id}</td>
                <td>{res.guestName}</td>
                <td>{res.roomNumber}</td>
                <td>{res.checkIn}</td>
                <td>{getStatusBadge(res.status)}</td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  
                  {/* Botones contextuales según el estado */}
                  {(res.status === 'PENDIENTE' || res.status === 'CONFIRMADA') && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => changeReservationStatus(res.id, 'CHECKED_IN')}
                    >
                      Check-In
                    </button>
                  )}

                  {res.status === 'CHECKED_IN' && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => changeReservationStatus(res.id, 'CHECKED_OUT')}
                    >
                      Check-Out
                    </button>
                  )}

                  {(res.status === 'PENDIENTE' || res.status === 'CONFIRMADA') && (
                    <button 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => changeReservationStatus(res.id, 'CANCELADA')}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#6b21a8' }}>
                  No hay reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Nueva Reserva */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(59, 7, 100, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
            <h3 style={{ color: '#3b0764', marginTop: 0 }}>Crear Nueva Reserva</h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Nombre del Huésped</label>
                <input required type="text" name="guestName" value={formData.guestName || ''} onChange={handleChange} 
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>N° de Habitación</label>
                <input required type="text" name="roomNumber" value={formData.roomNumber || ''} onChange={handleChange} 
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Fecha de Check-In</label>
                <input required type="date" name="checkIn" value={formData.checkIn || ''} onChange={handleChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #6b21a8', color: '#6b21a8', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Guardar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};