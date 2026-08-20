import { useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[] | readonly { value: T; label: string }[] | { value: T; label: string }[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function Select<T extends string>({ value, onChange, options, placeholder, className, id }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const opts = options as (T | { value: T; label: string })[];
  const current = opts.find((o) => (typeof o === 'string' ? o === value : o.value === value));
  const currentLabel = typeof current === 'string' ? current : current?.label ?? '';
  const currentVal = typeof current === 'string' ? current : current?.value;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="input flex items-center justify-between text-left"
      >
        <span className={value ? 'text-ink' : 'text-muted/60'}>{currentLabel || placeholder || 'Select…'}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lift animate-scale-in">
          <ul className="max-h-60 overflow-auto py-1">
            {opts.map((o) => {
              const val = typeof o === 'string' ? o : o.value;
              const label = typeof o === 'string' ? o : o.label;
              const selected = val === currentVal;
              return (
                <li key={val}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(val);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-ink/5',
                      selected ? 'text-ink font-medium' : 'text-ink/80',
                    )}
                  >
                    {label}
                    {selected && <Check className="h-4 w-4 text-ink" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
