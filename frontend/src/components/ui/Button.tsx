import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const V = {
  primary:
    'btn-glow text-white',
  secondary:
    'bg-gradient-to-r from-cyan-500/80 to-sky-500/80 text-white border border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-px transition-all duration-200',
  ghost:
    'text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--hv)] border border-transparent transition-all duration-150',
  danger:
    'bg-gradient-to-r from-red-600/90 to-rose-600/90 text-white border border-red-400/20 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-px transition-all duration-200',
  outline:
    'btn-ghost-border',
};

const S = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
  md: 'px-4.5 py-2   text-sm gap-2   rounded-xl',
  lg: 'px-7   py-3   text-sm gap-2   rounded-2xl font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:!transform-none disabled:!shadow-none ${V[variant]} ${S[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={13} className="animate-spin shrink-0" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
