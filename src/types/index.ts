export type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'HUESPED' | 'GUEST';

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string; // <-- Nuevo campo para la imagen
}

export interface RoomRequest {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
  description?: string;
  imageUrl?: string;
}

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELADA';

/**
 * Reserva de habitación. La devuelve el BFF, que la obtiene de forma síncrona
 * desde ms-hotel-rooms. Los campos opcionales vienen null cuando el dato no aplica.
 */
export interface Reservation {
  id: string;
  guestName: string;
  guestEmail?: string | null;
  roomNumber: string;
  roomType?: string | null;
  checkIn: string;
  checkOut?: string | null;
  guests?: number | null;
  totalAmount?: number | null;
  status: ReservationStatus;
  notes?: string | null;
  requestedAt?: string | null;
  updatedAt?: string | null;
}

/** Cuerpo de POST /api/v1/reservations. */
export interface ReservationCreateRequest {
  guestName: string;
  guestEmail?: string;
  roomNumber: string;
  checkIn: string;
  checkOut?: string;
  guests?: number;
  notes?: string;
}

/** Respuesta de PATCH /api/v1/reservations/{id}/status (202 Accepted). */
export interface ReservationStatusChange {
  id: string;
  status: ReservationStatus;
  message: string;
  changedAt: string;
}

export interface CognitoJwtPayload {
  'cognito:groups'?: string[];
  email?: string;
  exp?: number;
  iss?: string;
}
