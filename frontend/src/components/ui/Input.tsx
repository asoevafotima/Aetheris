import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900
            placeholder-slate-400 outline-none transition-all duration-150 shadow-sm
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
            }
            ${icon ? 'pl-9' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        ref={ref}
        className={`
          w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900
          placeholder-slate-400 outline-none transition-all duration-150 resize-none shadow-sm
          ${error
            ? 'border-red-400 focus:border-red-500'
            : 'border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`
          w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5
          text-sm text-slate-900 outline-none transition-all duration-150 shadow-sm
          focus:border-purple-500 focus:ring-2 focus:ring-purple-100 cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
