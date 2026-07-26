import { PRICE_PER_SEAT } from '../constants';

interface BookingPanelProps {
  selectedSeats: string[];
  onRemoveSeat: (seatId: string) => void;
  onReserve: () => void;
  loading: boolean;
}

export default function BookingPanel({
  selectedSeats,
  onRemoveSeat,
  onReserve,
  loading,
}: BookingPanelProps) {
  const subtotal = selectedSeats.length * PRICE_PER_SEAT;
  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.03) : 0;
  const total = subtotal + convenienceFee;

  return (
    <div className="glass sticky top-24 space-y-5 rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold text-white">Booking Summary</h3>

      {selectedSeats.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-700/50">
            <svg className="h-8 w-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
          </div>
          <p className="text-sm text-dark-400">
            Click on available seats to
            <br />
            start your booking
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-widest text-dark-400 uppercase">Selected Seats</span>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <button
                  key={seat}
                  id={`remove-seat-${seat}`}
                  onClick={() => onRemoveSeat(seat)}
                  className="group flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/30 transition-all hover:bg-rose-500/15 hover:text-rose-300 hover:ring-rose-500/30"
                >
                  {seat}
                  <svg className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">
                {selectedSeats.length} × ₹{PRICE_PER_SEAT}
              </span>
              <span className="text-white">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Convenience fee (3%)</span>
              <span className="text-white">₹{convenienceFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="font-semibold text-white">Total</span>
              <span className="font-display text-2xl font-bold text-white">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            id="reserve-btn"
            onClick={onReserve}
            disabled={loading}
            className="relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reserving...
              </span>
            ) : (
              <>
                Reserve Seats
                <span className="ml-2 text-violet-200">→</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-dark-500">You'll have 10 minutes to complete payment.</p>
        </>
      )}
    </div>
  );
}
