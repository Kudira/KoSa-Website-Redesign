'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { useToast } from '@/components/admin/Toast';
import type { Locale } from '@/lib/i18n/dictionaries';

export interface TreatmentFormValues {
  id?: string;
  slug: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  currency: string;
  image: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
  translations: Partial<Record<Locale, Record<string, string>>>;
}

const EMPTY: TreatmentFormValues = {
  slug: '',
  name: '',
  description: '',
  durationMin: 60,
  price: 0,
  currency: 'GHS',
  image: '',
  category: '',
  status: 'PUBLISHED',
  sortOrder: 0,
  translations: {},
};

export function TreatmentForm({ initial }: { initial?: Partial<TreatmentFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<TreatmentFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof TreatmentFormValues>(k: K, v: TreatmentFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug || undefined,
        name: values.name,
        description: values.description || null,
        durationMin: Number(values.durationMin),
        price: Number(values.price),
        currency: values.currency.toUpperCase(),
        image: values.image || null,
        category: values.category || null,
        status: values.status,
        sortOrder: Number(values.sortOrder),
        translations: values.translations,
      };
      const url = isNew ? '/api/admin/treatments' : `/api/admin/treatments/${values.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Save failed');
      }
      const json = await res.json();
      toast.push('success', isNew ? 'Treatment created' : 'Treatment saved');
      if (isNew && json?.treatment?.id) {
        startTransition(() => router.push(`/admin/wellness/${json.treatment.id}`));
      } else {
        startTransition(() => router.refresh());
      }
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!values.id) return;
    if (!confirm('Delete this treatment?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/treatments/${values.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Delete failed');
      }
      toast.push('success', 'Treatment deleted');
      startTransition(() => router.push('/admin/wellness'));
    } catch (err) {
      toast.push('error', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Basics</h2>
            <TextField label="Name" name="name" required value={values.name} onChange={(e) => set('name', e.target.value)} />
            <TextField
              label="Slug"
              name="slug"
              value={values.slug}
              onChange={(e) => set('slug', e.target.value)}
              hint="Auto-generated from the name if blank."
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Category" name="category" value={values.category} onChange={(e) => set('category', e.target.value)} hint="Spa · Yoga · Sound · Group" />
              <TextField type="number" min="1" label="Duration (min)" name="durationMin" value={values.durationMin} onChange={(e) => set('durationMin', Number(e.target.value))} />
              <TextField type="number" step="0.01" min="0" label="Price" name="price" value={values.price} onChange={(e) => set('price', Number(e.target.value))} required />
              <TextField label="Currency" name="currency" value={values.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} />
            </div>
            <TextareaField label="Description" name="description" rows={5} value={values.description} onChange={(e) => set('description', e.target.value)} />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Imagery</h2>
            <MediaPickerSingle label="Image" name="image" value={values.image} onChange={(v) => set('image', v)} folder="wellness" />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Translations</h2>
            <TranslationTabs
              fields={[
                { name: 'name', label: 'Name' },
                { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
              ]}
              defaults={{ name: values.name, description: values.description }}
              value={values.translations}
              onChange={(v) => set('translations', v)}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">Status</h2>
              <StatusToggle value={values.status} onChange={(v) => set('status', v)} />
            </div>
            <TextField type="number" label="Sort order" name="sortOrder" value={values.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            <div className="pt-4 border-t border-warm-grey/30 space-y-2">
              <Button type="submit" disabled={submitting || pending} className="w-full">
                <Save size={14} /> {isNew ? 'Create' : 'Save'}
              </Button>
              {!isNew && (
                <Button type="button" variant="danger" onClick={onDelete} disabled={submitting} className="w-full">
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
