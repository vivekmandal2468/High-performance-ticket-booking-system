import { PRICE_PER_SEAT } from '../constants';

interface SuccessViewProps {
  bookingId: string;
  selectedSeats: string[];
  onNewBooking: () => void;
}

export default function SuccessView({ bookingId, selectedSeats, onNewBooking }: SuccessViewProps) {
  const total = selectedSeats.length * PRICE_PER_SEAT + Math.round(selectedSeats.length * PRICE_PER_SEAT * 0.03);

  return (
    <div className="animate-bounce-in mx-auto max-w-lg text-center">
      <div className="glass rounded-2xl p-10">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40">
          <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="font-display mb-2 text-3xl font-bold text-white">Booking Confirmed! 🎉</h2>
        <p className="mb-8 text-dark-400">Your tickets have been booked successfully.</p>

        <div className="glass-light mb-8 space-y-3 rounded-xl p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Booking ID</span>
            <span className="font-mono text-violet-300">{bookingId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Show</span>
            <span className="font-medium text-white">Coldplay Live Concert</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Seats</span>
            <span className="font-semibold text-white">{selectedSeats.join(', ')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Venue</span>
            <span className="text-white">DY Patil Stadium, Mumbai</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-3">
            <span className="font-medium text-dark-400">Amount Paid</span>
            <span className="font-display text-xl font-bold text-emerald-400">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 ring-1 ring-emerald-500/20">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Confirmation sent to your email
        </div>

        <button
          id="new-booking-btn"
          onClick={onNewBooking}
          className="w-full cursor-pointer rounded-xl bg-dark-700 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-all hover:bg-dark-600 hover:ring-white/20"
        >
          Book More Tickets
        </button>
      </div>
    </div>
  );
}
