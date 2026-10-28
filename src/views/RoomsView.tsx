import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from 'react-oidc-context';
import axiosInstance from '../api/axiosInstance';
import { createReservation } from '../api/reservationsApi';
import type { Room, UserRole } from '../types';

interface RoomsProps {
  userRoles: UserRole[];
}

export const RoomsView: React.FC<RoomsProps> = ({ userRoles }) => {
  const isAdmin = userRoles.includes('ADMIN');
  const auth = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
      return `HTTP ${error.response?.status ?? 'sin respuesta'}: ${typeof error.response?.data === 'string' ? error.response.data : error.message}`;
    }
    return error instanceof Error ? error.message : 'Error desconocido';
  };

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await axiosInstance.get<Room[]>('/api/v1/rooms');
        setRooms(response.data);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadRooms();
  }, []);

  // Estados para el Modal y el Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({});

  const openModal = (room?: Room) => {
    if (room) {
      setFormData(room); // Modo Edición
    } else {
      setFormData({ isAvailable: true, roomType: 'SINGLE' }); // Modo Creación
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : 
               (name === 'pricePerNight' ? parseFloat(value) : value)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const request = {
      roomNumber: formData.roomNumber ?? '',
      roomType: formData.roomType ?? 'SINGLE',
      pricePerNight: formData.pricePerNight ?? 0,
      isAvailable: formData.isAvailable ?? true,
      description: formData.description,
      imageUrl: formData.imageUrl,
    };

    try {
      if (formData.id) {
        const response = await axiosInstance.put<Room>(`/api/v1/rooms/${formData.id}`, request);
        setRooms((previous) => previous.map((room) => room.id === response.data.id ? response.data : room));
      } else {
        const response = await axiosInstance.post<Room>('/api/v1/rooms', request);
        setRooms((previous) => [...previous, response.data]);
      }
      closeModal();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      setErrorMessage('');
      try {
        await axiosInstance.delete(`/api/v1/rooms/${id}`);
        setRooms((previous) => previous.filter((room) => room.id !== id));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    }
  };

  // --- Reservar desde el catálogo ---
  // La reserva no se guarda aquí: se pide al BFF, que la encola en SNS y la crea la Lambda.
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingNotice, setBookingNotice] = useState('');
  const [bookingForm, setBookingForm] = useState({ guestName: '', checkIn: '', checkOut: '', guests: 1 });

  const todayISO = () => new Date().toISOString().split('T')[0];
  const addDaysISO = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const openBooking = (room: Room) => {
    setBookingRoom(room);
    setBookingError('');
    setBookingNotice('');
    setBookingForm({
      guestName: auth.user?.profile?.email ?? '',
      checkIn: todayISO(),
      checkOut: addDaysISO(1),
      guests: 1,
    });
  };

  const closeBooking = () => {
    setBookingRoom(null);
  };

  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoom) return;
    setIsBooking(true);
    setBookingError('');
    try {
      const created = await createReservation({
        guestName: bookingForm.guestName.trim() || 'Sin Nombre',
        guestEmail: auth.user?.profile?.email,
        roomNumber: bookingRoom.roomNumber,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut || undefined,
        guests: bookingForm.guests,
      });
      setBookingNotice(
        `Reserva ${created.id} en cola para la habitación ${bookingRoom.roomNumber}.`
      );
      setBookingRoom(null);
    } catch (error) {
      setBookingError(getErrorMessage(error));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2 className="page-title">Catálogo de Habitaciones</h2>
          <p className="page-subtitle">Explora y administra las habitaciones disponibles.</p>
        </div>
        
        {isAdmin && (
          <button className="btn-primary" onClick={() => openModal()}>+ Nueva Habitación</button>
        )}
      </div>

      {errorMessage && <p role="alert" style={{ color: '#b91c1c' }}>{errorMessage}</p>}
      {bookingNotice && <p role="status" style={{ color: '#047857' }}>{bookingNotice}</p>}
      {isLoading && <p>Cargando habitaciones...</p>}

      {/* Grid de Habitaciones */}
      {!isLoading && (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="card room-card">
              <img
                className="room-image"
                src={room.imageUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                alt={`Habitación ${room.roomNumber}`} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div className="room-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: '0', color: '#3b0764' }}>Hab. {room.roomNumber}</h3>
                  <span className={`badge ${room.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                    {room.isAvailable ? 'Disponible' : 'Ocupada'}
                  </span>
                </div>
                <p style={{ color: '#6b21a8', margin: '10px 0' }}>Tipo: <strong>{room.roomType}</strong></p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6', margin: '0' }}>
                  \${room.pricePerNight} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>USD / noche</span>
                </p>
                
                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px' }}>
                  {isAdmin ? (
                    <>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openModal(room)}>Editar</button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ flex: 1 }}
                      disabled={!room.isAvailable}
                      onClick={() => openBooking(room)}
                    >
                      {room.isAvailable ? 'Reservar Ahora' : 'No Disponible'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="modal-shell" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(59, 7, 100, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div className="card modal-card">
            <h3 style={{ color: '#3b0764', marginTop: 0 }}>
              {formData.id ? 'Editar Habitación' : 'Nueva Habitación'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>N° de Habitación</label>
                <input 
                  required 
                  type="text" 
                  name="roomNumber" 
                  value={formData.roomNumber || ''} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Tipo</label>
                <select 
                  name="roomType" 
                  value={formData.roomType || 'SINGLE'} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff' }}
                >
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="SUITE">Suite</option>
                  <option value="PRESIDENCIAL">Presidencial</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Precio por Noche (USD)</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  name="pricePerNight" 
                  value={formData.pricePerNight || ''} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe la habitación, sus servicios o características"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>URL de la Imagen</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl || ''} 
                  onChange={handleChange} 
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  name="isAvailable" 
                  checked={formData.isAvailable || false} 
                  onChange={handleChange} 
                  id="isAvailable" 
                />
                <label htmlFor="isAvailable" style={{ color: '#6b21a8', cursor: 'pointer' }}>Marcar como Disponible</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #6b21a8', color: '#6b21a8', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Reserva (el catálogo público ofrece "Reservar Ahora") */}
      {bookingRoom && (
        <div className="modal-shell" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(59, 7, 100, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div className="card modal-card">
            <h3 style={{ color: '#3b0764', marginTop: 0 }}>
              Reservar habitación {bookingRoom.roomNumber}
            </h3>

            {bookingError && (
              <p role="alert" style={{ color: '#b91c1c' }}>{bookingError}</p>
            )}

            <form onSubmit={submitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>
                  Nombre del Huésped
                </label>
                <input required type="text" name="guestName" value={bookingForm.guestName} onChange={handleBookingChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>
                  Check-In
                </label>
                <input required type="date" name="checkIn" value={bookingForm.checkIn} onChange={handleBookingChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>
                  Check-Out
                </label>
                <input type="date" name="checkOut" value={bookingForm.checkOut} onChange={handleBookingChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>
                  Huéspedes
                </label>
                <input type="number" min="1" name="guests" value={bookingForm.guests} onChange={handleBookingChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeBooking} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #6b21a8', color: '#6b21a8', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isBooking}>
                  {isBooking ? 'Enviando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};