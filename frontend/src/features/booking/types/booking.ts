export interface ShowInfo {
  id: string;
  title: string;
  totalSeats: number;
  createdAt: string;
}

export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED';

export interface ShowData {
  show: ShowInfo;
  seats: Record<string, SeatStatus>;
}

export interface ReserveResponse {
  message: string;
  bookingId: string;
  expiresInSeconds: number;
}

export interface ConfirmResponse {
  message: string;
  bookingId: string;
}

export type BookingPhase =
  | 'loading'
  | 'selecting'
  | 'reserving'
  | 'reserved'
  | 'confirming'
  | 'confirmed'
  | 'error';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
