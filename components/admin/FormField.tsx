import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface BaseProps {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FieldShell({
  label,
  name,
  hint,
  error,
  required,
  className,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <label className={cn('block', className)} htmlFor={name}>
      <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-umber/50">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </label>
  );
}

type InputProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> & {
    name: string;
  };

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, name, hint, error, required, className, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <input
        ref={ref}
        id={name}
        name={name}
        required={required}
        {...rest}
        className={cn(
          'w-full bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber',
          rest.disabled && 'opacity-60 cursor-not-allowed',
        )}
      />
    </FieldShell>
  );
});

type TextareaProps = BaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> & { name: string };

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaField(
  { label, name, hint, error, required, className, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <textarea
        ref={ref}
        id={name}
        name={name}
        required={required}
        {...rest}
        className={cn(
          'w-full bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber',
          'min-h-[96px]',
        )}
      />
    </FieldShell>
  );
});

type SelectProps = BaseProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> & {
    name: string;
    options: { value: string; label: string }[];
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { label, name, hint, error, required, className, options, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <select
        ref={ref}
        id={name}
        name={name}
        required={required}
        {...rest}
        className="w-full bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

interface TagInputProps extends BaseProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

import { useState } from 'react';
import { X as XIcon } from 'lucide-react';

export function TagInputField({
  label,
  name,
  hint,
  error,
  required,
  className,
  values,
  onChange,
  placeholder,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  function add() {
    const t = draft.trim();
    if (!t) return;
    if (values.includes(t)) {
      setDraft('');
      return;
    }
    onChange([...values, t]);
    setDraft('');
  }
  return (
    <FieldShell label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/15 text-umber text-xs">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-umber/60 hover:text-umber"
              aria-label={`Remove ${v}`}
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          id={name}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder || 'Add and press enter'}
          className="flex-1 bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 text-xs font-poppins uppercase tracking-tracked-sm border border-umber/30 rounded-md text-umber hover:border-primary hover:text-primary"
        >
          Add
        </button>
      </div>
    </FieldShell>
  );
}
