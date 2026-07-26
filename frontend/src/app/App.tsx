import { useCallback, useEffect, useState } from 'react';
import Header from '../shared/components/Header';
import NotificationToast from '../shared/components/NotificationToast';
import { confirmPayment, fetchShowDetails, reserveSeats } from '../features/booking/api/bookingApi';
import BookingPanel from '../features/booking/components/BookingPanel';
import PaymentView from '../features/booking/components/PaymentView';
import SeatMap from '../features/booking/components/SeatMap';
import ShowHero from '../features/booking/components/ShowHero';
import SuccessView from '../features/booking/components/SuccessView';
import { MAX_SEATS_PER_BOOKING, SHOW_ID } from '../features/booking/constants';
import type { BookingPhase, Notification, SeatStatus, ShowInfo } from '../features/booking/types/booking';

const USER_ID = `user_${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const [phase, setPhase] = useState<BookingPhase>('loading');
  const [show, setShow] = useState<ShowInfo | null>(null);
  const [seats, setSeats] = useState<Record<string, SeatStatus>>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((type: Notification['type'], message: string) => {
    setNotification({ id: Date.now().toString(), type, message });
  }, []);

  const loadShow = useCallback(async () => {
    try {
      const data = await fetchShowDetails(SHOW_ID);
      setShow(data.show);
      setSeats(data.seats);
      setPhase('selecting');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load show';
      notify('error', message);
      setPhase('error');
    }
  }, [notify]);

  useEffect(() => {
    loadShow();
  }, [loadShow]);

  const toggleSeat = useCallback(
    (seatId: string) => {
      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          return prev.filter((seat) => seat !== seatId);
        }

        if (prev.length >= MAX_SEATS_PER_BOOKING) {
          notify('info', `Maximum ${MAX_SEATS_PER_BOOKING} seats per booking`);
          return prev;
        }

        return [...prev, seatId];
      });
    },
    [notify],
  );

  const removeSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat !== seatId));
  }, []);

  const handleReserve = useCallback(async () => {
    if (selectedSeats.length === 0) {
      notify('info', 'Please select at least one seat');
      return;
    }

    setLoading(true);
    try {
      const response = await reserveSeats(USER_ID, SHOW_ID, selectedSeats);
      setBookingId(response.bookingId);
      setExpiresIn(response.expiresInSeconds);
      setPhase('reserved');
      notify('success', 'Seats reserved. Complete payment to confirm booking.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reservation failed';
      notify('error', message);
      await loadShow();
    } finally {
      setLoading(false);
    }
  }, [loadShow, notify, selectedSeats]);

  const handleConfirm = useCallback(async () => {
    if (!bookingId) {
      notify('error', 'Missing booking ID. Please reserve seats again.');
      return;
    }

    setLoading(true);
    try {
      await confirmPayment(bookingId);
      setPhase('confirmed');
      notify('success', 'Payment confirmed. Tickets booked successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      notify('error', message);
    } finally {
      setLoading(false);
    }
  }, [bookingId, notify]);

  const handleReset = useCallback(() => {
    setSelectedSeats([]);
    setBookingId('');
    setExpiresIn(0);
    setPhase('loading');
    loadShow();
  }, [loadShow]);

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-dark-600 border-t-violet-500" />
          <p className="text-sm text-dark-400">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error' && !show) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass max-w-md rounded-2xl p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <span className="text-3xl">⚠</span>
          </div>
          <h2 className="font-display mb-2 text-xl font-bold text-white">Connection Error</h2>
          <p className="mb-6 text-sm text-dark-400">Make sure backend server is running on port 3000.</p>
          <button
            onClick={handleReset}
            className="cursor-pointer rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header onReset={handleReset} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {show ? <ShowHero show={show} /> : null}

        <div className="mt-8">
          {phase === 'confirmed' ? (
            <SuccessView bookingId={bookingId} selectedSeats={selectedSeats} onNewBooking={handleReset} />
          ) : phase === 'reserved' ? (
            <PaymentView
              bookingId={bookingId}
              selectedSeats={selectedSeats}
              expiresInSeconds={expiresIn}
              onConfirm={handleConfirm}
              onExpire={handleReset}
              loading={loading}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display mb-6 text-lg font-bold text-white">Select Your Seats</h3>
                <SeatMap
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onToggleSeat={toggleSeat}
                  disabled={loading}
                />
              </div>
              <BookingPanel
                selectedSeats={selectedSeats}
                onRemoveSeat={removeSeat}
                onReserve={handleReserve}
                loading={loading}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-dark-500">
          Built with Express.js • PostgreSQL • Redis • BullMQ • React • TypeScript • Tailwind CSS
        </p>
        <p className="mt-1 text-xs text-dark-600">High-Performance Ticket Booking Backend Service</p>
      </footer>

      <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
