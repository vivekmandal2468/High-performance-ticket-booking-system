import type { ConfirmResponse, ReserveResponse, ShowData } from '../types/booking';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchShowDetails(showId: string): Promise<ShowData> {
  const response = await fetch(`${API_BASE}/shows/${showId}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to fetch show details'));
  }

  return response.json();
}

export async function reserveSeats(
  userId: string,
  showId: string,
  seatNumbers: string[],
): Promise<ReserveResponse> {
  const response = await fetch(`${API_BASE}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, showId, seatNumbers }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Reservation failed'));
  }

  return response.json();
}

export async function confirmPayment(bookingId: string): Promise<ConfirmResponse> {
  const response = await fetch(`${API_BASE}/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Payment confirmation failed'));
  }

  return response.json();
}
