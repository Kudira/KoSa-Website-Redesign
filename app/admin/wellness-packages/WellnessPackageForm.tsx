'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField } from '@/components/admin/FormField';
import { MediaPickerSingle, MediaPickerMulti } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { useToast } from '@/components/admin/Toast';

const CATEGORIES = [
  'Leisure', 'Wellness', 'Romance', 'Celebration', 'Culture', 'Day Visit', 'Eco',
];

export interface PackageFormValues {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  durationLabel: string;
  priceGhs: number;
  originalPriceGhs: number | null;
  priceNote: string;
  couplePriceGhs: number | null;
  couplePriceNote: string;
  inclusions: string[];
  image: string;
  gallery: string[];
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

const EMPTY: PackageFormValues = {
  slug: '', name: '', tagline: '', category: 'Wellness', durationLabel: '',
  priceGhs: 0, originalPriceGhs: null, priceNote: 'Solo',
  couplePriceGhs: null, couplePriceNote: '', inclusions: [],
  image: '', gallery: [],
  status: 'PUBLISHED', sortOrder: 0,
};

export function WellnessPackageForm({ initial }: { initial?: Partial<PackageFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<PackageFormValues>({ ...EMPTY, ...initial });
  const [newInclusion, setNewInclusion] = useState('');
  const isNew = !values.id;

  function set<K extends keyof PackageFormValues>(k: K, v: PackageFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function addInclusion() {
    const item = newInclusion.trim();
    if (!item) return;
    set('inclusions', [...values.inclusions, item]);
    setNewInclusion('');
  }

  function removeInclusion(idx: number) {
    set('inclusions', values.inclusions.filter((_, i) => i !== idx));
  }

  function autoSlug(name: string) {
    if (!isNew) return;
    set('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const method = isNew ? 'POST' : 'PATCH';
    const url = isNew ? '/api/admin/wellness-packages' : `/api/admin/wellness-packages/${values.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          priceGhs: Number(values.priceGhs),
          originalPriceGhs: values.originalPriceGhs ? Number(values.originalPriceGhs) : null,
          couplePriceGhs: values.couplePriceGhs ? Number(values.couplePriceGhs) : null,
          couplePriceNote: values.couplePriceNote || null,
          sortOrder: Number(values.sortOrder),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      toast.push('success', isNew ? 'Package created' : 'Package updated');
      startTransition(() => router.push('/admin/wellness-packages'));
      router.refresh();
    } catch (e) { toast.push('error', (e as Error).message); }
    finally { setSubmitting(false); }
  }

  async function onDelete() {
    if (!values.id || !confirm('Delete this package?')) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/wellness-packages/${values.id}`, { method: 'DELETE' });
      toast.push('success', 'Package deleted');
      startTransition(() => router.push('/admin/wellness-packages'));
      router.refresh();
    } catch { toast.push('error', 'Delete failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <TextField label="Package Name" name="name" value={values.name}
        onChange={(e) => { set('name', e.target.value); autoSlug(e.target.value); }}
        placeholder="The KoSa Reset" required />
      <TextField label="Slug" name="slug" value={values.slug}
        onChange={(e) => set('slug', e.target.value)}
        placeholder="the-ko-sa-reset" required />
      <TextField label="Tagline" name="tagline" value={values.tagline}
        onChange={(e) => set('tagline', e.target.value)}
        placeholder="Five days of ocean air, healing rituals and stillness" required />
      <MediaPickerSingle label="Cover image" name="image" value={values.image}
        onChange={(v) => set('image', v)} folder="packages"
        hint="Shown on the package card. Use a high-quality landscape photo." />
      <MediaPickerMulti label="Gallery (optional)" name="gallery" values={values.gallery}
        onChange={(v) => set('gallery', v)} folder="packages"
        hint="Extra photos to showcase this package." />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Category" name="category" value={values.category}
          onChange={(e) => set('category', e.target.value)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <TextField label="Duration Label" name="durationLabel" value={values.durationLabel}
          onChange={(e) => set('durationLabel', e.target.value)} placeholder="5 Nights Minimum" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Price (GHC)" name="priceGhs" value={String(values.priceGhs)}
          onChange={(e) => set('priceGhs', Number(e.target.value))} type="number" required />
        <TextField label="Was Price (GHC, optional)" name="originalPriceGhs"
          value={String(values.originalPriceGhs ?? '')}
          onChange={(e) => set('originalPriceGhs', e.target.value ? Number(e.target.value) : null)} type="number" />
      </div>
      <TextField label="Price Note" name="priceNote" value={values.priceNote}
        onChange={(e) => set('priceNote', e.target.value)} placeholder="Solo" />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Couple Price (GHC, optional)" name="couplePriceGhs"
          value={String(values.couplePriceGhs ?? '')}
          onChange={(e) => set('couplePriceGhs', e.target.value ? Number(e.target.value) : null)} type="number" />
        <TextField label="Couple Price Note" name="couplePriceNote" value={values.couplePriceNote}
          onChange={(e) => set('couplePriceNote', e.target.value)} placeholder="Per Person (Couple)" />
      </div>

      {/* Inclusions */}
      <div>
        <label className="block text-sm font-opensans font-medium text-umber mb-2">
          What is Included
        </label>
        <ul className="space-y-1 mb-3">
          {values.inclusions.map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-sand-light rounded-md px-3 py-2 text-sm">
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => removeInclusion(i)}
                className="text-umber/40 hover:text-red-500">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInclusion(); }}}
            placeholder="Add inclusion item..."
            className="flex-1 border border-warm-grey/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          <button type="button" onClick={addInclusion}
            className="flex items-center gap-1 bg-primary text-cream px-3 py-2 rounded-lg text-sm hover:bg-primary-dark">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <TextField label="Sort Order" name="sortOrder" value={String(values.sortOrder)}
        onChange={(e) => set('sortOrder', Number(e.target.value))} type="number" />
      <StatusToggle value={values.status} onChange={(v) => set('status', v)} />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          <Save size={16} className="mr-2" />
          {submitting ? 'Saving...' : isNew ? 'Create Package' : 'Save Changes'}
        </Button>
        {!isNew && (
          <Button type="button" variant="danger" onClick={onDelete} disabled={submitting}>
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}
