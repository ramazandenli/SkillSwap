import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label htmlFor={inputId} className="flex flex-col gap-1 text-sm">
        {label && <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition',
            'placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </label>
    );
  },
);
Input.displayName = 'Input';
