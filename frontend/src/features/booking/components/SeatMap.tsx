import type { SeatStatus } from '../types/booking';

interface SeatMapProps {
  seats: Record<string, SeatStatus>;
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  disabled?: boolean;
}

const ROW_LABELS = 'ABCDEFGHIJ';
const SEATS_PER_ROW = 10;

function getSeatColor(status: SeatStatus, isSelected: boolean): string {
  if (isSelected) {
    return 'bg-violet-500 ring-2 ring-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]';
  }

  switch (status) {
    case 'AVAILABLE':
      return 'cursor-pointer bg-dark-700 ring-1 ring-white/10 hover:bg-dark-600 hover:ring-violet-400/50';
    case 'RESERVED':
      return 'cursor-not-allowed bg-amber-500/20 ring-1 ring-amber-500/30';
    case 'BOOKED':
      return 'cursor-not-allowed bg-rose-500/20 ring-1 ring-rose-500/30';
    default:
      return 'bg-dark-700';
  }
}

export default function SeatMap({ seats, selectedSeats, onToggleSeat, disabled }: SeatMapProps) {
  const rows: string[][] = [];
  for (let rowIndex = 0; rowIndex < ROW_LABELS.length; rowIndex += 1) {
    const row: string[] = [];
    for (let seatIndex = 1; seatIndex <= SEATS_PER_ROW; seatIndex += 1) {
      const seatId = `${ROW_LABELS[rowIndex]}${seatIndex}`;
      if (seats[seatId] !== undefined) {
        row.push(seatId);
      }
    }
    if (row.length > 0) {
      rows.push(row);
    }
  }

  const availableCount = Object.values(seats).filter((status) => status === 'AVAILABLE').length;
  const bookedCount = Object.values(seats).filter((status) => status === 'BOOKED').length;
  const reservedCount = Object.values(seats).filter((status) => status === 'RESERVED').length;

  return (
    <div className="space-y-6">
      <div className="relative mx-auto w-3/4 max-w-md">
        <div className="h-2 rounded-b-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
        <div className="mt-2 text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-dark-400 uppercase">✦ Stage ✦</span>
        </div>
        <div className="mt-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent" />
      </div>

      <div className="flex flex-col items-center gap-1.5 py-4">
        {rows.map((row, rowIndex) => (
          <div key={ROW_LABELS[rowIndex]} className="flex items-center gap-1.5" style={{ animationDelay: `${rowIndex * 50}ms` }}>
            <span className="w-6 text-center text-xs font-bold text-dark-500">{ROW_LABELS[rowIndex]}</span>
            <div className="flex gap-1.5">
              {row.slice(0, 5).map((seatId) => {
                const status = seats[seatId];
                const isSelected = selectedSeats.includes(seatId);
                const isClickable = status === 'AVAILABLE' && !disabled;

                return (
                  <button
                    key={seatId}
                    id={`seat-${seatId}`}
                    disabled={!isClickable}
                    onClick={() => {
                      if (isClickable) {
                        onToggleSeat(seatId);
                      }
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold transition-all duration-200 md:h-9 md:w-9 md:text-xs ${getSeatColor(status, isSelected)} ${
                      isSelected
                        ? 'scale-110 text-white'
                        : status === 'AVAILABLE'
                          ? 'text-dark-400 hover:scale-105 hover:text-white'
                          : 'text-dark-500'
                    }`}
                    title={`Seat ${seatId} — ${isSelected ? 'Selected' : status}`}
                  >
                    {seatId.slice(1)}
                  </button>
                );
              })}
            </div>

            <div className="w-6 md:w-10" />

            <div className="flex gap-1.5">
              {row.slice(5).map((seatId) => {
                const status = seats[seatId];
                const isSelected = selectedSeats.includes(seatId);
                const isClickable = status === 'AVAILABLE' && !disabled;

                return (
                  <button
                    key={seatId}
                    id={`seat-${seatId}`}
                    disabled={!isClickable}
                    onClick={() => {
                      if (isClickable) {
                        onToggleSeat(seatId);
                      }
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold transition-all duration-200 md:h-9 md:w-9 md:text-xs ${getSeatColor(status, isSelected)} ${
                      isSelected
                        ? 'scale-110 text-white'
                        : status === 'AVAILABLE'
                          ? 'text-dark-400 hover:scale-105 hover:text-white'
                          : 'text-dark-500'
                    }`}
                    title={`Seat ${seatId} — ${isSelected ? 'Selected' : status}`}
                  >
                    {seatId.slice(1)}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-center text-xs font-bold text-dark-500">{ROW_LABELS[rowIndex]}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-dark-700 ring-1 ring-white/10" />
          <span className="text-xs text-dark-400">Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
          <span className="text-xs text-dark-400">Selected ({selectedSeats.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-amber-500/20 ring-1 ring-amber-500/30" />
          <span className="text-xs text-dark-400">Reserved ({reservedCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-rose-500/20 ring-1 ring-rose-500/30" />
          <span className="text-xs text-dark-400">Booked ({bookedCount})</span>
        </div>
      </div>
    </div>
  );
}
