import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const V: Record<string, string> = {
  primary:   'btn-primary font-semibold text-white',
  secondary: 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white border border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-px transition-all duration-200',
  ghost:     'btn-ghost',
  danger:    'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/20 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-px transition-all duration-200',
  outline:   'btn-outline',
};

const S: Record<string, string> = {
  sm: 'px-3   py-1.5 text-xs  gap-1.5 rounded-xl',
  md: 'px-4   py-2   text-sm  gap-2   rounded-xl',
  lg: 'px-5   py-2.5 text-sm  gap-2   rounded-xl font-semibold',
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
