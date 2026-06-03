import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', glow, hover, glass, ...props }: CardProps) {
  const base = glass ? 'glass' : 'card-theme surface-transition';
  return (
    <div
      className={`${base} ${hover || glass ? 'glass-hover' : ''} ${glow ? 'ring-1 ring-purple-500/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 border-b border-[var(--border)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`} {...props}>{children}</div>;
}
