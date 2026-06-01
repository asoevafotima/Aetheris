import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary:   'bg-purple-600 hover:bg-purple-700 text-white shadow-sm border border-purple-600',
  secondary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm border border-cyan-600',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent',
  danger:    'bg-red-600 hover:bg-red-700 text-white border border-red-600',
  outline:   'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
