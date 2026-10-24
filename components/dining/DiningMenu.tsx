'use client';

// Interactive, filterable dining menu. Section names become filter tabs;
// selecting one shows that section's dishes. Dishes show dietary badges and a
// price when one is set. Driven entirely by the Dining CMS.

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  dietary: string[];
  isFeatured: boolean;
}
interface MenuSection {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

const DIETARY_LABEL: Record<string, string> = {
  VG: 'Vegetarian', VEGAN: 'Vegan', GF: 'Gluten-free', DF: 'Dairy-free', HALAL: 'Halal',
};

export function DiningMenu({
  sections,
  labels,
}: {
  sections: MenuSection[];
  labels: { all: string; popular: string };
}) {
  const withItems = useMemo(() => sections.filter((s) => s.items.length > 0), [sections]);
  const [active, setActive] = useState<string>('all');

  const visible = active === 'all' ? withItems : withItems.filter((s) => s.id === active);
  if (withItems.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-12" role="group">
        {[{ id: 'all', name: labels.all }, ...withItems].map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              aria-pressed={isActive}
              className={`h-11 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-500 ${
                isActive ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/20 hover:bg-forest/5'
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
        {visible.map((section) => (
          <div key={section.id}>
            <h3 className="font-display text-3xl">{section.name}</h3>
            {section.description && <p className="mt-2 opacity-65">{section.description}</p>}
            <ul className="mt-6">
              {section.items.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-baseline gap-3">
                    <p className="font-display text-xl">{item.name}</p>
                    <span aria-hidden className="flex-1 translate-y-[-4px] border-b border-dotted border-forest/30" />
                    {item.price !== null && (
                      <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(item.price, item.currency)}</span>
                    )}
                  </div>
                  {(item.description || item.isFeatured || item.dietary.length > 0) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {item.description && <p className="opacity-70 leading-relaxed mr-1">{item.description}</p>}
                      {item.isFeatured && (
                        <span className="text-xs font-medium bg-sunshine/40 px-2.5 py-0.5 rounded-full">{labels.popular}</span>
                      )}
                      {item.dietary.map((d) => (
                        <span key={d} title={DIETARY_LABEL[d] ?? d} className="text-xs font-medium ring-1 ring-inset ring-forest/25 px-2.5 py-0.5 rounded-full">
                          {DIETARY_LABEL[d] ?? d}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
