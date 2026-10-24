import { cn } from '@/lib/utils';

interface Props {
  name?: string;
  value: 'DRAFT' | 'PUBLISHED';
  onChange: (v: 'DRAFT' | 'PUBLISHED') => void;
}

export function StatusToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-warm-grey/40 bg-cream overflow-hidden">
      {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={cn(
            'px-3 py-1.5 text-[10px] font-poppins uppercase tracking-tracked-sm transition-colors',
            value === s
              ? 'bg-primary text-umber'
              : 'text-umber/60 hover:text-umber',
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
