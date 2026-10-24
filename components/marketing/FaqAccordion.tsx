'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { prose } from '@/lib/content/media';

interface Item {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-b" style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `faq-${i}`;
        return (
          <div key={item.q} className="border-t" style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
              aria-controls={id}
            >
              <span className="font-display text-xl md:text-2xl">{item.q}</span>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-500 ease-tide ${isOpen ? 'rotate-45' : ''}`} style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, currentColor 25%, transparent)' }}>
                <Plus size={18} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-lg leading-relaxed opacity-80">{prose(item.a)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
