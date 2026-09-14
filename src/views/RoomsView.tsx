import React, { useState } from 'react';
import type { Room, UserRole } from '../types';

interface RoomsProps {
  userRoles: UserRole[];
}

export const RoomsView: React.FC<RoomsProps> = ({ userRoles }) => {
  const isAdmin = userRoles.includes('ADMIN');

  // 1. Estado local de Habitaciones (Simulando la base de datos)
  const [rooms, setRooms] = useState<Room[]>([
    { 
      id: 1, roomNumber: '101', roomType: 'SUITE', pricePerNight: 150.00, isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&q=80'
    },
    { 
      id: 2, roomNumber: '102', roomType: 'DOUBLE', pricePerNight: 90.00, isAvailable: false,
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&q=80'
    },
  ]);

  // 2. Estados para el Modal y el Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({});

  // 3. Funciones CRUD simuladas (Memoria local)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : 
               (name === 'pricePerNight' ? parseFloat(value) : value)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // MOCK UPDATE: Actualizar habitación existente
      setRooms((prev) => prev.map((r) => (r.id === formData.id ? { ...r, ...formData } as Room : r)));
    } else {
      // MOCK CREATE: Crear nueva habitación con ID aleatorio
      const newRoom = { ...formData, id: Date.now() } as Room;
      setRooms((prev) => [...prev, newRoom]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      // MOCK DELETE: Filtrar la habitación eliminada
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#3b0764' }}>Catálogo de Habitaciones</h2>
        
        {isAdmin && (
          <button className="btn-primary" onClick={() => openModal()}>+ Nueva Habitación</button>
        )}
      </div>

      {/* Grid de Habitaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {rooms.map((room) => (
          <div key={room.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img 
              src={room.imageUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
              alt={`Habitación ${room.roomNumber}`} 
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0', color: '#3b0764' }}>Hab. {room.roomNumber}</h3>
                <span className={`badge ${room.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                  {room.isAvailable ? 'Disponible' : 'Ocupada'}
                </span>
              </div>
              <p style={{ color: '#6b21a8', margin: '10px 0' }}>Tipo: <strong>{room.roomType}</strong></p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6', margin: '0' }}>
                ${room.pricePerNight} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>USD / noche</span>
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
                  <button className="btn-primary" style={{ flex: 1 }} disabled={!room.isAvailable}>
                    {room.isAvailable ? 'Reservar Ahora' : 'No Disponible'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD (Solo se renderiza si está abierto) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(59, 7, 100, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '30px' }}>
            <h3 style={{ color: '#3b0764', marginTop: 0 }}>
              {formData.id ? 'Editar Habitación' : 'Nueva Habitación'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>N° de Habitación</label>
                <input required type="text" name="roomNumber" value={formData.roomNumber || ''} onChange={handleChange} 
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Tipo</label>
                <select name="roomType" value={formData.roomType || 'SINGLE'} onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff' }}>
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="SUITE">Suite</option>
                  <option value="PRESIDENCIAL">Presidencial</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>Precio por Noche (USD)</label>
                <input required type="number" min="0" step="0.01" name="pricePerNight" value={formData.pricePerNight || ''} onChange={handleChange}
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8', fontWeight: 'bold' }}>URL de la Imagen</label>
                <input type="url" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://..."
                       style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f3e8ff', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="isAvailable" checked={formData.isAvailable || false} onChange={handleChange} id="isAvailable" />
                <label htmlFor="isAvailable" style={{ color: '#6b21a8', cursor: 'pointer' }}>Marcar como Disponible</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #6b21a8', color: '#6b21a8', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};