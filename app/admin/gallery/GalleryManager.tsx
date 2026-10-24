'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';
import { StatusBadge } from '@/components/admin/DataTable';
import { uploadMedia } from '@/lib/admin/uploadMedia';

interface Item {
  id: string;
  imageUrl: string;
  caption: string | null;
  alt: string | null;
  category: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

export function GalleryManager({ initial }: { initial: Item[] }) {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>(initial);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pasteUrl, setPasteUrl] = useState('');

  // Search + filter (makes finding and browsing media easier).
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [status, setStatus] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const it of items) if (it.category) seen.add(it.category);
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (status !== 'all' && it.status !== status) return false;
      if (activeCat !== 'all' && (it.category ?? '') !== activeCat) return false;
      if (!q) return true;
      const hay = [it.caption, it.alt, it.category, it.imageUrl.split('/').pop()]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, activeCat, status]);

  // Reordering only makes sense over the full, unfiltered list.
  const filtering = query.trim() !== '' || activeCat !== 'all' || status !== 'all';

  async function createFromUrl(url: string) {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          status: 'PUBLISHED',
          sortOrder: items.length,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setItems((s) => [...s, j.item]);
      toast.push('success', 'Image added');
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadMedia(file, { folder: 'gallery' });
        await createFromUrl(url);
      }
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, patch: Partial<Item>) {
    setItems((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove from gallery? The file stays in your media library.')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setItems((s) => s.filter((x) => x.id !== id));
      toast.push('success', 'Removed');
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((x) => x.id === id);
    const target = idx + dir;
    if (idx === -1 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next.map((x, i) => ({ ...x, sortOrder: i })));
    // Persist new sortOrder for the two affected rows
    await Promise.all([
      fetch(`/api/admin/gallery/${next[idx].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: idx }),
      }),
      fetch(`/api/admin/gallery/${next[target].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: target }),
      }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="bg-cream border border-warm-grey/40 rounded-md p-4 flex flex-col sm:flex-row gap-3 items-stretch">
        <input
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              createFromUrl(pasteUrl);
              setPasteUrl('');
            }
          }}
          placeholder="Paste image URL and press enter"
          className="flex-1 bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm text-umber"
        />
        <Button
          type="button"
          onClick={() => {
            createFromUrl(pasteUrl);
            setPasteUrl('');
          }}
          disabled={busy}
        >
          <Plus size={14} /> Add by URL
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload size={14} /> Upload
        </Button>
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          ref={fileRef}
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Search + filter toolbar */}
      {items.length > 0 && (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-umber/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search caption, alt, category or filename…"
                className="w-full bg-bg-orange border border-warm-grey/30 rounded-md pl-9 pr-9 py-2 text-sm text-umber"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-umber/40 hover:text-umber"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm text-umber"
            >
              <option value="all">All statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {['all', ...categories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  aria-pressed={activeCat === cat}
                  className={`px-3 py-1 rounded-full text-xs font-poppins uppercase tracking-tracked-sm border transition-colors ${
                    activeCat === cat
                      ? 'bg-umber text-cream border-umber'
                      : 'border-warm-grey/40 text-umber/75 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-umber/55">
            Showing {filtered.length} of {items.length}
            {filtering ? ' · reordering is available when no filters are active' : ''}
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center text-umber/60 text-sm">
          No gallery images yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center text-umber/60 text-sm">
          No media match your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const idx = items.findIndex((x) => x.id === it.id);
            return (
            <article key={it.id} className="bg-cream border border-warm-grey/40 rounded-md overflow-hidden">
              <div className="relative aspect-[4/3] bg-sand-light">
                <Image src={it.imageUrl} alt={it.alt ?? it.caption ?? ''} fill sizes="400px" className="object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <input
                  value={it.caption ?? ''}
                  onChange={(e) => patch(it.id, { caption: e.target.value || null })}
                  placeholder="Caption (optional)"
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-sm"
                />
                <input
                  value={it.alt ?? ''}
                  onChange={(e) => patch(it.id, { alt: e.target.value || null })}
                  placeholder="Alt text (accessibility)"
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-sm"
                />
                <input
                  value={it.category ?? ''}
                  onChange={(e) => patch(it.id, { category: e.target.value || null })}
                  placeholder="Category (e.g. rooms, beach)"
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                />
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <StatusBadge status={it.status} />
                  <div className="flex gap-1">
                    {!filtering && (
                      <>
                        <Button type="button" size="sm" variant="secondary" onClick={() => move(it.id, -1)} disabled={idx === 0}>
                          <ArrowUp size={12} />
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => move(it.id, 1)} disabled={idx === items.length - 1}>
                          <ArrowDown size={12} />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        patch(it.id, { status: it.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' })
                      }
                    >
                      {it.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => remove(it.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
