import React, { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  changeReservationStatus,
  createReservation,
  listReservations,
} from '../api/reservationsApi';
import type { Reservation, ReservationStatus } from '../types';

// Las escrituras son asíncronas (BFF -> SNS -> SQS -> Lambda), así que la lista se
// refresca sola: la reserva recién creada aparece cuando la Lambda la insertó.
const REFRESH_MS = 10000;

const todayISO = () => new Date().toISOString().split('T')[0];

const addDaysISO = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    const detail =
      typeof data === 'string'
        ? data
        : (data?.message ?? data?.error ?? error.message);
    return `HTTP ${error.response?.status ?? 'sin respuesta'}: ${detail}`;
  }
  return error instanceof Error ? error.message : 'Error desconocido';
};

export const ReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');

  // Estados para el Modal de nueva reserva
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    guestName: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes: string;
  }>({
    guestName: '',
    roomNumber: '',
    checkIn: todayISO(),
    checkOut: addDaysISO(1),
    guests: 1,
    notes: '',
  });

  // El cargador vive en un ref para poder refrescar la tabla desde los handlers
  // (tras crear o cambiar una reserva) sin duplicar la lógica.
  const loadRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listReservations({ limit: 200 });
        setReservations(data);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadRef.current = load;
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const loadReservations = () => loadRef.current();

  // Funciones para manejar estados rápidos (Check-In / Check-Out)
  const changeReservationStatusById = async (
    id: string,
    newStatus: ReservationStatus
  ) => {
    setErrorMessage('');
    setNotice('');
    try {
      const result = await changeReservationStatus(id, newStatus);
      setNotice(result.message);
      // El cambio lo aplica la Lambda: recargamos a la vuelta para verlo reflejado.
      window.setTimeout(() => void loadReservations(), 1200);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  // Funciones del Formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox
        ? (e.target as HTMLInputElement).checked
        : name === 'guests'
          ? parseInt(value, 10) || 1
          : value,
    }));
  };

  const openModal = (roomNumber = '') => {
    setFormData({
      guestName: '',
      roomNumber,
      checkIn: todayISO(),
      checkOut: addDaysISO(1),
      guests: 1,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setNotice('');

    try {
      const created = await createReservation({
        guestName: formData.guestName.trim() || 'Sin Nombre',
        roomNumber: formData.roomNumber.trim(),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut || undefined,
        guests: formData.guests,
        notes: formData.notes.trim() || undefined,
      });
      setNotice(
        `Reserva ${created.id} en cola. La Lambda la confirma en unos segundos.`
      );
      closeModal();
      window.setTimeout(() => void loadReservations(), 1500);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMADA':
        return <span className="badge badge-success">Confirmada</span>;
      case 'PENDIENTE':
        return <span className="badge badge-warning">Pendiente</span>;
      case 'CHECKED_IN':
        return (
          <span className="badge" style={{ background: '#3b0764', color: 'white' }}>
            En Habitación
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="badge" style={{ background: '#e2e8f0', color: '#475569' }}>
            Finalizada
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="badge" style={{ background: '#fee2e2', color: '#ef4444' }}>
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  const visibleReservations = statusFilter
    ? reservations.filter((res) => res.status === statusFilter)
    : reservations;

  const formatMoney = (value?: number | null) =>
    value === null || value === undefined
      ? '—'
      : `$${Number(value).toLocaleString('es-CL', { maximumFractionDigits: 2 })} USD`;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2 className="page-title">Gestión de Reservas</h2>
          <p className="page-subtitle">
            Control de ingresos y salidas del día.
          </p>
        </div>
        <div className="page-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CHECKED_IN">En habitación</option>
            <option value="CHECKED_OUT">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <button className="btn-primary" onClick={() => openModal()}>
            + Nueva Reserva
          </button>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {errorMessage}
        </p>
      )}
      {notice && (
        <p role="status" style={{ color: '#047857' }}>
          {notice}
        </p>
      )}
      {isLoading && <p>Cargando reservas...</p>}

      {/* Tabla de Reservas */}
      <div className="card responsive-table">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Total</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {visibleReservations.map((res) => (
              <tr key={res.id}>
                <td style={{ fontWeight: 'bold', color: '#3b0764' }}>{res.id.slice(0, 8)}</td>
                <td>{res.guestName}</td>
                <td>
                  {res.roomNumber}
                  {res.roomType ? ` (${res.roomType})` : ''}
                </td>
                <td>{res.checkIn}</td>
                <td>{res.checkOut || '—'}</td>
                <td>{formatMoney(res.totalAmount)}</td>
                <td>{getStatusBadge(res.status)}</td>
                <td
                  style={{
                    textAlign: 'right',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Botones contextuales según el estado */}
                  {(res.status === 'PENDIENTE' || res.status === 'CONFIRMADA') && (
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => void changeReservationStatusById(res.id, 'CHECKED_IN')}
                    >
                      Check-In
                    </button>
                  )}

                  {res.status === 'CHECKED_IN' && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => void changeReservationStatusById(res.id, 'CHECKED_OUT')}
                    >
                      Check-Out
                    </button>
                  )}

                  {(res.status === 'PENDIENTE' || res.status === 'CONFIRMADA') && (
                    <button
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                      onClick={() => void changeReservationStatusById(res.id, 'CANCELADA')}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {visibleReservations.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#6b21a8' }}>
                  No hay reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Nueva Reserva */}
      {isModalOpen && (
        <div
          className="modal-shell"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(59, 7, 100, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div className="card modal-card">
            <h3 style={{ color: '#3b0764', marginTop: 0 }}>Crear Nueva Reserva</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                  }}
                >
                  Nombre del Huésped
                </label>
                <input
                  required
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #f3e8ff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                  }}
                >
                  N° de Habitación
                </label>
                <input
                  required
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="101"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #f3e8ff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                  }}
                >
                  Fecha de Check-In
                </label>
                <input
                  required
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #f3e8ff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                  }}
                >
                  Fecha de Check-Out
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #f3e8ff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#6b21a8',
                    fontWeight: 'bold',
                  }}
                >
                  Huéspedes
                </label>
                <input
                  type="number"
                  min="1"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #f3e8ff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid #6b21a8',
                    color: '#6b21a8',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                  {isSaving ? 'Enviando...' : 'Guardar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
