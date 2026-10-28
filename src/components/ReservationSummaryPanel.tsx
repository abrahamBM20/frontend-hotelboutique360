import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { listReservations } from '../api/reservationsApi';
import type { Reservation, UserRole } from '../types';

interface PanelProps {
  userRoles: UserRole[];
}

const todayISO = () => new Date().toISOString().split('T')[0];

const money = (value: number) =>
  `$${value.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;

/**
 * Panel de reservas con datos reales.
 *
 * Todo pasa por el BFF: el frontend pide GET /api/v1/reservations y el BFF lo resuelve
 * delegando en ms-hotel-rooms. Para un huésped (sin rol de staff) el BFF
 * devuelve solo sus propias reservas.
 */
export default function ReservationSummaryPanel({ userRoles }: PanelProps) {
  const isStaff = userRoles.includes('ADMIN') || userRoles.includes('RECEPCIONISTA');

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listReservations({ limit: 200 });
        setReservations(data);
        setErrorMessage('');
      } catch (error) {
        if (isAxiosError(error)) {
          setErrorMessage(`HTTP ${error.response?.status ?? 'sin respuesta'}: ${error.message}`);
        } else {
          setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, []);

  if (isLoading) {
    return <p>Cargando reservas...</p>;
  }

  if (errorMessage) {
    return (
      <p role="alert" style={{ color: '#b91c1c' }}>
        {errorMessage}
      </p>
    );
  }

  const today = todayISO();
  const pendientes = reservations.filter((r) => r.status === 'PENDIENTE');
  const confirmadas = reservations.filter((r) => r.status === 'CONFIRMADA');
  const enHabitacion = reservations.filter((r) => r.status === 'CHECKED_IN');
  const finalizadas = reservations.filter((r) => r.status === 'CHECKED_OUT');
  const checkInsHoy = reservations.filter((r) => r.checkIn === today);
  const ingresos = reservations
    .filter((r) => r.status === 'CHECKED_IN' || r.status === 'CHECKED_OUT')
    .reduce((total, r) => total + Number(r.totalAmount ?? 0), 0);

  // Vista del huésped: su reserva activa.
  if (!isStaff) {
    const activa =
      enHabitacion[0] ?? confirmadas[0] ?? pendientes[0] ?? finalizadas[0] ?? null;

    if (!activa) {
      return (
        <div className="card" style={{ background: '#faf5ff' }}>
          <h4 style={{ color: '#3b0764', marginTop: 0, marginBottom: '10px' }}>Aún no tienes reservas</h4>
          <p style={{ color: '#6b21a8', marginBottom: '20px' }}>
            Explora nuestras habitaciones y reserva tu próxima visita.
          </p>
        </div>
      );
    }

    return (
      <div className="card">
        <h4 style={{ color: '#3b0764', marginTop: 0, marginBottom: '15px' }}>Tu Reserva Activa</h4>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Habitación:</strong> {activa.roomNumber}
              {activa.roomType ? ` (${activa.roomType})` : ''}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Check-In:</strong> {activa.checkIn}
            </p>
            {activa.checkOut && (
              <p style={{ margin: '5px 0' }}>
                <strong>Check-Out:</strong> {activa.checkOut}
              </p>
            )}
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <span
              className="badge badge-success"
              style={{ fontSize: '1rem', padding: '8px 16px' }}
            >
              {activa.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Vista del staff: indicadores + reservas de hoy.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Reservas Totales
          </h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>
            {reservations.length}
          </p>
          <p style={{ color: '#6b21a8', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
            {pendientes.length} pendientes · {confirmadas.length} confirmadas
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Check-Ins Hoy
          </h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: '0' }}>
            {checkInsHoy.length}
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b0764' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            En Habitación
          </h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b0764', margin: '0' }}>
            {enHabitacion.length}
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Ingresos Registrados
          </h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', margin: '0' }}>
            {money(ingresos)}
          </p>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '20px' }}>
        <h4 style={{ color: '#3b0764', marginTop: 0, marginBottom: '15px' }}>
          Reservas de Hoy
        </h4>
        <table className="table-custom" style={{ minWidth: '500px', width: '100%' }}>
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {checkInsHoy.map((res) => (
              <tr key={res.id}>
                <td style={{ fontWeight: 'bold' }}>{res.guestName}</td>
                <td>
                  {res.roomNumber}
                  {res.roomType ? ` (${res.roomType})` : ''}
                </td>
                <td>
                  <span
                    className={
                      res.status === 'CONFIRMADA' ? 'badge badge-success' : 'badge badge-warning'
                    }
                  >
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
            {checkInsHoy.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#6b21a8' }}>
                  No hay check-ins para hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
