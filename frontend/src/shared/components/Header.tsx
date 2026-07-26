interface HeaderProps {
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          id="header-logo"
          onClick={onReset}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">
              Book<span className="text-violet-400">My</span>Seat
            </h1>
            <p className="text-[10px] font-medium tracking-widest text-dark-400 uppercase">Live Events</p>
          </div>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">System Online</span>
          </div>
          <div className="glass-light rounded-full px-4 py-2">
            <span className="text-sm font-medium text-dark-400">🎵 High-Performance Booking Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
