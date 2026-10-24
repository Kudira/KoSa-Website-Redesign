'use client';

// Compact menu editor manages sections and items for a single venue.
// Sections and items are created/updated/deleted via direct API calls so the
// editor stays responsive even on slow links.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';

interface ItemRow {
  id: string;
  sectionId: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  dietary: string[];
  isFeatured: boolean;
  sortOrder: number;
}

interface SectionRow {
  id: string;
  venueId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  items: ItemRow[];
}

interface Props {
  venueId: string;
  sections: SectionRow[];
}

export function MenuEditor({ venueId, sections: initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [sections, setSections] = useState<SectionRow[]>(initial);
  const [busy, setBusy] = useState(false);

  async function addSection() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/dining/sections', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ venueId, name: 'New section', sortOrder: sections.length }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setSections((s) => [...s, { ...j.section, items: [] }]);
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveSection(s: SectionRow) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/dining/sections/${s.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: s.name, description: s.description, sortOrder: s.sortOrder }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed');
      }
      toast.push('success', 'Section saved');
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section and all its items?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/dining/sections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setSections((s) => s.filter((x) => x.id !== id));
      toast.push('success', 'Section deleted');
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addItem(sectionId: string) {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/dining/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          name: 'New item',
          dietary: [],
          isFeatured: false,
          sortOrder: 0,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setSections((s) =>
        s.map((x) =>
          x.id === sectionId ? { ...x, items: [...x.items, { ...j.item, price: j.item.price === null ? null : Number(j.item.price) }] } : x,
        ),
      );
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveItem(item: ItemRow) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/dining/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          dietary: item.dietary,
          isFeatured: item.isFeatured,
          sortOrder: item.sortOrder,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed');
      }
      toast.push('success', 'Item saved');
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(itemId: string, sectionId: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/dining/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setSections((s) =>
        s.map((x) => (x.id === sectionId ? { ...x, items: x.items.filter((i) => i.id !== itemId) } : x)),
      );
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function updateSection(id: string, patch: Partial<SectionRow>) {
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function updateItem(sectionId: string, itemId: string, patch: Partial<ItemRow>) {
    setSections((s) =>
      s.map((x) =>
        x.id === sectionId
          ? { ...x, items: x.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : x,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="font-belleza text-2xl text-umber">Menu</h2>
        <Button type="button" onClick={addSection} disabled={busy || pending}>
          <Plus size={14} /> Add section
        </Button>
      </header>

      {sections.length === 0 && (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-8 text-center text-sm text-umber/60">
          No sections yet. Add one to start building this menu.
        </div>
      )}

      {sections.map((s) => (
        <section key={s.id} className="bg-cream border border-warm-grey/40 rounded-md p-6">
          <header className="flex flex-wrap gap-3 items-end justify-between mb-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <input
                value={s.name}
                onChange={(e) => updateSection(s.id, { name: e.target.value })}
                className="w-full bg-bg-orange border-b border-warm-grey/30 focus:border-primary focus:outline-none px-2 py-1 font-belleza text-xl text-umber"
              />
              <input
                value={s.description ?? ''}
                onChange={(e) => updateSection(s.id, { description: e.target.value })}
                placeholder="Section description (optional)"
                className="w-full bg-transparent border-b border-warm-grey/20 focus:border-primary focus:outline-none px-2 py-1 text-sm text-umber/80"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={s.sortOrder}
                onChange={(e) => updateSection(s.id, { sortOrder: Number(e.target.value) })}
                className="w-16 bg-bg-orange border border-warm-grey/30 rounded px-2 py-1 text-xs text-umber"
                title="Sort order"
              />
              <Button type="button" size="sm" variant="secondary" onClick={() => saveSection(s)} disabled={busy}>
                Save
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => deleteSection(s.id)} disabled={busy}>
                <Trash2 size={12} />
              </Button>
            </div>
          </header>

          <div className="space-y-3">
            {s.items.map((it) => (
              <div key={it.id} className="border border-warm-grey/30 rounded-md p-3 bg-bg-orange/40">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(s.id, it.id, { name: e.target.value })}
                    placeholder="Name"
                    className="col-span-12 md:col-span-4 bg-cream border border-warm-grey/40 rounded px-3 py-2 text-sm"
                  />
                  <input
                    value={it.description ?? ''}
                    onChange={(e) => updateItem(s.id, it.id, { description: e.target.value })}
                    placeholder="Description"
                    className="col-span-12 md:col-span-5 bg-cream border border-warm-grey/40 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={it.price ?? ''}
                    onChange={(e) =>
                      updateItem(s.id, it.id, { price: e.target.value === '' ? null : Number(e.target.value) })
                    }
                    placeholder="Price"
                    className="col-span-6 md:col-span-2 bg-cream border border-warm-grey/40 rounded px-3 py-2 text-sm"
                  />
                  <input
                    value={it.currency}
                    onChange={(e) => updateItem(s.id, it.id, { currency: e.target.value.toUpperCase() })}
                    className="col-span-6 md:col-span-1 bg-cream border border-warm-grey/40 rounded px-3 py-2 text-sm uppercase"
                    maxLength={3}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 justify-between">
                  <label className="flex items-center gap-2 text-xs text-umber/70">
                    <input
                      type="checkbox"
                      checked={it.isFeatured}
                      onChange={(e) => updateItem(s.id, it.id, { isFeatured: e.target.checked })}
                    />
                    Featured
                  </label>
                  <input
                    value={it.dietary.join(', ')}
                    onChange={(e) =>
                      updateItem(s.id, it.id, {
                        dietary: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Dietary tags (VG, GF, …)"
                    className="flex-1 min-w-[160px] bg-cream border border-warm-grey/40 rounded px-3 py-1.5 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => saveItem(it)} disabled={busy}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => deleteItem(it.id, s.id)} disabled={busy}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={() => addItem(s.id)} disabled={busy}>
              <Plus size={12} /> Add item
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
