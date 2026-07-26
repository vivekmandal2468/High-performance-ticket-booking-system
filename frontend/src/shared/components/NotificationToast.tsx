import { useEffect } from 'react';
import type { Notification } from '../../features/booking/types/booking';

interface NotificationToastProps {
  notification: Notification | null;
  onDismiss: () => void;
}

const ICONS: Record<Notification['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLORS: Record<Notification['type'], string> = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  error: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  info: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
};

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (!notification) {
      return;
    }
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) {
    return null;
  }

  return (
    <div className="animate-fade-in-up fixed right-6 bottom-6 z-50">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 ring-1 shadow-2xl ${COLORS[notification.type]}`}>
        <span className="text-lg">{ICONS[notification.type]}</span>
        <span className="text-sm font-medium">{notification.message}</span>
        <button onClick={onDismiss} className="ml-2 cursor-pointer opacity-60 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}
