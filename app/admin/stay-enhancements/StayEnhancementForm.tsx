'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { useToast } from '@/components/admin/Toast';
import { ENHANCEMENT_CATEGORIES } from '@/lib/cms/stay-enhancements';

export interface EnhancementFormValues {
  id?: string;
  category: string;
  name: string;
  description: string;
  priceGhs: number;
  priceTo: number | null;
  priceNote: string;
  image: string;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

const EMPTY: EnhancementFormValues = {
  category: ENHANCEMENT_CATEGORIES[0], name: '', description: '',
  priceGhs: 0, priceTo: null, priceNote: '', image: '', status: 'PUBLISHED', sortOrder: 0,
};

export function StayEnhancementForm({ initial }: { initial?: Partial<EnhancementFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<EnhancementFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof EnhancementFormValues>(k: K, v: EnhancementFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const method = isNew ? 'POST' : 'PATCH';
    const url = isNew ? '/api/admin/stay-enhancements' : `/api/admin/stay-enhancements/${values.id}`;
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          description: values.description || null,
          priceGhs: Number(values.priceGhs),
          priceTo: values.priceTo ? Number(values.priceTo) : null,
          priceNote: values.priceNote || null,
          sortOrder: Number(values.sortOrder),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      toast.push('success', isNew ? 'Enhancement created' : 'Enhancement updated');
      startTransition(() => router.push('/admin/stay-enhancements'));
      router.refresh();
    } catch (e) { toast.push('error', (e as Error).message); }
    finally { setSubmitting(false); }
  }

  async function onDelete() {
    if (!values.id || !confirm('Delete this enhancement?')) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/stay-enhancements/${values.id}`, { method: 'DELETE' });
      toast.push('success', 'Enhancement deleted');
      startTransition(() => router.push('/admin/stay-enhancements'));
      router.refresh();
    } catch { toast.push('error', 'Delete failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <SelectField label="Category" name="category" value={values.category}
        onChange={(e) => set('category', e.target.value)}
        options={ENHANCEMENT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
      <TextField label="Name" name="name" value={values.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Private Beach Breakfast for Two" required />
      <TextareaField label="Description (optional)" name="description" value={values.description}
        onChange={(e) => set('description', e.target.value)} rows={2}
        placeholder="1 hour on the beach, professional photographer included" />
      <MediaPickerSingle label="Image" name="image" value={values.image}
        onChange={(v) => set('image', v)} folder="enhancements"
        hint="A photo that showcases this add-on. Shown on the public card." />
      <div className="grid grid-cols-3 gap-4">
        <TextField label="Price (GHC)" name="priceGhs" value={String(values.priceGhs)}
          onChange={(e) => set('priceGhs', Number(e.target.value))} type="number" required />
        <TextField label="Price To (GHC)" name="priceTo" value={String(values.priceTo ?? '')}
          onChange={(e) => set('priceTo', e.target.value ? Number(e.target.value) : null)} type="number" />
        <TextField label="Price Note" name="priceNote" value={values.priceNote}
          onChange={(e) => set('priceNote', e.target.value)} placeholder="per person" />
      </div>
      <TextField label="Sort Order" name="sortOrder" value={String(values.sortOrder)}
        onChange={(e) => set('sortOrder', Number(e.target.value))} type="number" />
      <StatusToggle value={values.status} onChange={(v) => set('status', v)} />
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          <Save size={16} className="mr-2" />
          {submitting ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
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
