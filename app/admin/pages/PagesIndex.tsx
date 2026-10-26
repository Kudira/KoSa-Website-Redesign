'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

interface PageRow { id: string; label: string; path: string; fields: number; edited: number }
interface Hit { page: string; pageLabel: string; section: string; label: string; text: string; kind: string }

export function PagesIndex({ pages, index }: { pages: PageRow[]; index: Hit[] }) {
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 3) return [];
    return index.filter((h) => h.text.toLowerCase().includes(s) || h.label.toLowerCase().includes(s)).slice(0, 40);
  }, [q, index]);

  return (
    <div className="space-y-8">
      <label className="relative block max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-umber/40" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find any wording on the site, e.g. “first light”"
          className="w-full rounded-md border border-warm-grey/50 bg-cream py-3 pl-10 pr-3 text-sm text-umber outline-none focus:border-primary"
        />
      </label>

      {q.trim().length >= 3 && (
        <div className="rounded-md border border-warm-grey/40 bg-cream">
          {hits.length === 0 ? (
            <p className="p-4 text-sm text-umber/60">Nothing matches. Rooms, treatments, menus and similar lists are edited in their own sections.</p>
          ) : (
            <ul className="divide-y divide-warm-grey/30">
              {hits.map((h, i) => (
                <li key={i}>
                  <Link href={`/admin/pages/${h.page}#${encodeURIComponent(h.section)}`} className="block p-4 hover:bg-umber/5">
                    <p className="text-xs text-umber/55">{h.pageLabel} · {h.section} · {h.label}</p>
                    <p className="mt-1 text-sm text-umber line-clamp-2">{h.kind === 'image' || h.kind === 'video' ? '(photo or film)' : h.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-warm-grey/40 bg-cream p-4">
            <Link href={`/admin/pages/${p.id}`} className="min-w-0 flex-1">
              <p className="font-medium text-umber">{p.label}</p>
              <p className="text-xs text-umber/55">
                {p.fields} editable items{p.edited ? ` · ${p.edited} changed` : ''}
              </p>
            </Link>
            <a href={p.path} target="_blank" rel="noreferrer" className="shrink-0 rounded p-2 text-umber/50 hover:bg-umber/5 hover:text-primary" aria-label={`Open ${p.label} on the website`}>
              <ExternalLink size={16} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
