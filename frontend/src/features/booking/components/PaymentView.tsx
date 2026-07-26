import { useEffect, useState } from 'react';
import { PRICE_PER_SEAT } from '../constants';

interface PaymentViewProps {
  bookingId: string;
  selectedSeats: string[];
  expiresInSeconds: number;
  onConfirm: () => void;
  onExpire: () => void;
  loading: boolean;
}

export default function PaymentView({
  bookingId,
  selectedSeats,
  expiresInSeconds,
  onConfirm,
  onExpire,
  loading,
}: PaymentViewProps) {
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);

  useEffect(() => {
    setTimeLeft(expiresInSeconds);
  }, [expiresInSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 60;
  const percentage = expiresInSeconds > 0 ? (timeLeft / expiresInSeconds) * 100 : 0;
  const total = selectedSeats.length * PRICE_PER_SEAT + Math.round(selectedSeats.length * PRICE_PER_SEAT * 0.03);

  return (
    <div className="animate-fade-in-up mx-auto max-w-lg space-y-8">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-dark-800 ring-2 ring-dark-600">
            <div className={`font-display text-3xl font-bold ${urgent ? 'animate-pulse text-rose-400' : 'text-white'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
          <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-dark-400">
            {timeLeft > 0 ? 'Complete payment before timer expires.' : 'Reservation expired.'}
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <h3 className="font-display text-xl font-bold text-white">Complete Your Payment</h3>
          <div className="glass-light mx-auto max-w-xs space-y-2 rounded-xl p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-400">Booking ID</span>
              <span className="font-mono text-xs text-violet-300">{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Seats</span>
              <span className="font-semibold text-white">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2">
              <span className="text-dark-400">Total</span>
              <span className="font-display text-lg font-bold text-white">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {['💳 Card', '📱 UPI', '🏦 Net'].map((method, index) => (
            <button
              key={method}
              className={`rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                index === 0
                  ? 'bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/50'
                  : 'bg-dark-700/50 text-dark-400 ring-1 ring-white/5 hover:ring-white/10'
              }`}
            >
              {method}
            </button>
          ))}
        </div>

        <button
          id="confirm-payment-btn"
          onClick={onConfirm}
          disabled={loading || timeLeft <= 0}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : timeLeft <= 0 ? (
            'Reservation Expired'
          ) : (
            `✓ Confirm Payment — ₹${total.toLocaleString()}`
          )}
        </button>

        {timeLeft <= 0 ? (
          <button
            onClick={onExpire}
            className="mt-4 cursor-pointer rounded-xl bg-dark-700 px-5 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-dark-600 hover:ring-white/20"
          >
            Select Seats Again
          </button>
        ) : null}
      </div>
    </div>
  );
}
