import axiosInstance from './axiosInstance';
import type {
  Reservation,
  ReservationCreateRequest,
  ReservationStatus,
  ReservationStatusChange,
} from '../types';

export interface ReservationFilters {
  status?: ReservationStatus;
  roomNumber?: string;
  limit?: number;
}

/**
 * Lista las reservas. El BFF filtra por usuario y ms-hotel-rooms consulta
 * síncronamente la tabla compartida.
 */
export const listReservations = async (
  filters: ReservationFilters = {}
): Promise<Reservation[]> => {
  const params: Record<string, string | number> = {};
  if (filters.status) params.status = filters.status;
  if (filters.roomNumber) params.roomNumber = filters.roomNumber;
  if (filters.limit) params.limit = filters.limit;

  const response = await axiosInstance.get<Reservation[]>('/api/v1/reservations', { params });
  return response.data;
};

/**
 * Crea una reserva. El BFF responde 202 Accepted: la Lambda inserta la fila después,
 * así que la reserva recién creada todavía no aparece en el listado.
 */
export const createReservation = async (
  request: ReservationCreateRequest
): Promise<Reservation> => {
  const response = await axiosInstance.post<Reservation>('/api/v1/reservations', request);
  return response.data;
};

/** Check-in, check-out o cancelación. También asíncrono (202 Accepted). */
export const changeReservationStatus = async (
  id: string,
  status: ReservationStatus,
  notes?: string
): Promise<ReservationStatusChange> => {
  const response = await axiosInstance.patch<ReservationStatusChange>(
    `/api/v1/reservations/${id}/status`,
    { status, notes }
  );
  return response.data;
};
