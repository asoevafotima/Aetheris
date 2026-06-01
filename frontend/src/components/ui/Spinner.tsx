export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-200 border-t-purple-600 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-t-2 border-purple-600 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm">Загрузка...</p>
      </div>
    </div>
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded h-4 ${className}`} />;
}
