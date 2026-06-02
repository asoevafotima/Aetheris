import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', glow, hover, ...props }: CardProps) {
  return (
    <div
      className={`
        card-theme surface-transition
        ${glow ? 'shadow-purple-200/60 dark:shadow-purple-900/30 shadow-md' : ''}
        ${hover ? 'hover:border-[var(--border-2)] hover:shadow-app-md cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 border-b border-[var(--border)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
