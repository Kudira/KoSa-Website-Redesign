'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';
import { StatusBadge } from '@/components/admin/DataTable';

interface Row {
  id: string;
  guestName: string;
  country: string | null;
  rating: number;
  quote: string;
  avatarUrl: string | null;
  source: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

export function TestimonialsManager({ initial }: { initial: Row[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial);
  const [busy, setBusy] = useState(false);

  function update(id: string, patch: Partial<Row>) {
    setRows((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function add() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          guestName: 'New guest',
          rating: 5,
          quote: 'A few words about their stay…',
          status: 'DRAFT',
          sortOrder: rows.length,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setRows((s) => [...s, j.testimonial]);
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save(r: Row) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${r.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          guestName: r.guestName,
          country: r.country,
          rating: r.rating,
          quote: r.quote,
          avatarUrl: r.avatarUrl,
          source: r.source,
          status: r.status,
          sortOrder: r.sortOrder,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed');
      }
      toast.push('success', 'Saved');
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setRows((s) => s.filter((r) => r.id !== id));
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === id);
    const t = idx + dir;
    if (idx === -1 || t < 0 || t >= rows.length) return;
    const next = [...rows];
    [next[idx], next[t]] = [next[t], next[idx]];
    setRows(next.map((r, i) => ({ ...r, sortOrder: i })));
    await Promise.all([
      fetch(`/api/admin/testimonials/${next[idx].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: idx }),
      }),
      fetch(`/api/admin/testimonials/${next[t].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: t }),
      }),
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={add} disabled={busy}>
          <Plus size={14} /> Add testimonial
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center text-umber/60 text-sm">
          No testimonials yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r, i) => (
            <article key={r.id} className="bg-cream border border-warm-grey/40 rounded-md p-5">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                <div className="space-y-2">
                  <input
                    value={r.guestName}
                    onChange={(e) => update(r.id, { guestName: e.target.value })}
                    placeholder="Guest name"
                    className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-sm font-medium"
                  />
                  <input
                    value={r.country ?? ''}
                    onChange={(e) => update(r.id, { country: e.target.value || null })}
                    placeholder="Country"
                    className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={r.rating}
                    onChange={(e) => update(r.id, { rating: Number(e.target.value) })}
                    className="w-20 bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                    title="Rating (1-5)"
                  />
                  <input
                    value={r.avatarUrl ?? ''}
                    onChange={(e) => update(r.id, { avatarUrl: e.target.value || null })}
                    placeholder="Avatar URL"
                    className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                  />
                  <input
                    value={r.source ?? ''}
                    onChange={(e) => update(r.id, { source: e.target.value || null })}
                    placeholder="Source (e.g. TripAdvisor)"
                    className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <textarea
                    value={r.quote}
                    onChange={(e) => update(r.id, { quote: e.target.value })}
                    rows={5}
                    className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 justify-between">
                <StatusBadge status={r.status} />
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="sm" variant="secondary" onClick={() => move(r.id, -1)} disabled={i === 0}>
                    <ArrowUp size={12} />
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => move(r.id, 1)} disabled={i === rows.length - 1}>
                    <ArrowDown size={12} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      update(r.id, { status: r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' })
                    }
                  >
                    {r.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button type="button" size="sm" onClick={() => save(r)} disabled={busy}>
                    <Save size={12} /> Save
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => remove(r.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
