export type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'HUESPED' | 'GUEST';

export interface Room {
  id: number;
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
}

export interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELADA';
}

export interface CognitoJwtPayload {
  'cognito:groups'?: string[];
  email?: string;
  exp?: number;
  iss?: string;
}