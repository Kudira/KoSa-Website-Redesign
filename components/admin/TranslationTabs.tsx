'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { SUPPORTED_LOCALES, type Locale, LOCALE_META } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  rows?: number;
}

interface Props {
  fields: FieldDef[];
  value: Partial<Record<Locale, Record<string, string>>>;
  onChange: (next: Partial<Record<Locale, Record<string, string>>>) => void;
  defaults: Record<string, string>; // EN values used as placeholders
}

/**
 * Translation editor. EN lives in the model's primary fields; this component
 * edits all *other* locales as overlays. Each locale gets one row of inputs
 * with the EN value shown as the placeholder so the editor can see context.
 */
export function TranslationTabs({ fields, value, onChange, defaults }: Props) {
  const nonEn = SUPPORTED_LOCALES.filter((l) => l !== 'en') as Locale[];
  const [active, setActive] = useState<Locale>(nonEn[0]);

  function update(locale: Locale, field: string, v: string) {
    const next = { ...value };
    const overlay = { ...(next[locale] || {}) };
    if (v.trim() === '') delete overlay[field];
    else overlay[field] = v;
    if (Object.keys(overlay).length) next[locale] = overlay;
    else delete next[locale];
    onChange(next);
  }

  return (
    <div className="border border-warm-grey/40 rounded-md overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-orange px-4 py-2 border-b border-warm-grey/30">
        <Languages size={14} className="text-primary" />
        <span className="font-poppins text-[10px] uppercase tracking-tracked text-umber/60">
          Translations (optional)
        </span>
        <div className="ml-auto flex gap-1">
          {nonEn.map((loc) => {
            const hasContent = value[loc] && Object.keys(value[loc]!).length > 0;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setActive(loc)}
                className={cn(
                  'text-xs px-3 py-1 rounded-md font-poppins uppercase tracking-tracked-sm',
                  active === loc
                    ? 'bg-primary text-umber'
                    : 'text-umber/60 hover:bg-umber/5',
                )}
                title={LOCALE_META[loc].label}
              >
                <span>{LOCALE_META[loc].code}</span>
                {hasContent && <span className="ml-1 text-[8px] text-primary">●</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 space-y-4 bg-cream">
        {fields.map((f) => {
          const v = value[active]?.[f.name] ?? '';
          const placeholder = defaults[f.name] || `Translate to ${LOCALE_META[active].native}`;
          if (f.type === 'textarea') {
            return (
              <label key={f.name} className="block">
                <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
                  {f.label}
                </span>
                <textarea
                  rows={f.rows || 3}
                  value={v}
                  onChange={(e) => update(active, f.name, e.target.value)}
                  placeholder={placeholder}
                  className="mt-2 w-full bg-bg-orange border border-warm-grey/30 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
                />
              </label>
            );
          }
          return (
            <label key={f.name} className="block">
              <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
                {f.label}
              </span>
              <input
                type="text"
                value={v}
                onChange={(e) => update(active, f.name, e.target.value)}
                placeholder={placeholder}
                className="mt-2 w-full bg-bg-orange border border-warm-grey/30 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
