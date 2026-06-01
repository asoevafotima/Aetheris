import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', glow, hover, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-slate-200 bg-white shadow-sm
        ${glow ? 'shadow-purple-200 shadow-md' : ''}
        ${hover ? 'hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer' : ''}
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
    <div className={`p-5 border-b border-slate-100 ${className}`} {...props}>
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
