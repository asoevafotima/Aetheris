export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-[var(--border)] border-t-purple-600 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-purple-900/40" />
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
        </div>
        <p className="text-purple-400 text-sm font-medium">Загрузка...</p>
      </div>
    </div>
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded h-4 ${className}`} />;
}
