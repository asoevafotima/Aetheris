import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: 'var(--accent)' }} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>Загрузка...</p>
      </div>
    </div>
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`shimmer h-4 ${className}`} />;
}
