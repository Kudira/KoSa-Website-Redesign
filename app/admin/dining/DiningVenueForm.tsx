'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField } from '@/components/admin/FormField';
import { MediaPickerSingle, MediaPickerMulti } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { useToast } from '@/components/admin/Toast';
import type { Locale } from '@/lib/i18n/dictionaries';

export interface VenueFormValues {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hours: string;
  image: string;
  gallery: string[];
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
  translations: Partial<Record<Locale, Record<string, string>>>;
}

const EMPTY: VenueFormValues = {
  slug: '',
  name: '',
  tagline: '',
  description: '',
  hours: '',
  image: '',
  gallery: [],
  status: 'PUBLISHED',
  sortOrder: 0,
  translations: {},
};

export function DiningVenueForm({ initial }: { initial?: Partial<VenueFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<VenueFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof VenueFormValues>(k: K, v: VenueFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug || undefined,
        name: values.name,
        tagline: values.tagline || null,
        description: values.description || null,
        hours: values.hours || null,
        image: values.image || null,
        gallery: values.gallery,
        status: values.status,
        sortOrder: Number(values.sortOrder),
        translations: values.translations,
      };
      const url = isNew ? '/api/admin/dining' : `/api/admin/dining/${values.id}`;
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
      toast.push('success', isNew ? 'Venue created' : 'Saved');
      if (isNew && json?.venue?.id) {
        startTransition(() => router.push(`/admin/dining/${json.venue.id}`));
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
    if (!confirm('Delete this venue and all its sections?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/dining/${values.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.push('success', 'Deleted');
      startTransition(() => router.push('/admin/dining'));
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
            <TextField label="Tagline" name="tagline" value={values.tagline} onChange={(e) => set('tagline', e.target.value)} />
            <TextField label="Slug" name="slug" value={values.slug} onChange={(e) => set('slug', e.target.value)} />
            <TextField label="Hours" name="hours" value={values.hours} onChange={(e) => set('hours', e.target.value)} hint="e.g. 'Dinner only · 6–10pm'" />
            <TextareaField label="Description" name="description" rows={5} value={values.description} onChange={(e) => set('description', e.target.value)} />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Imagery</h2>
            <MediaPickerSingle label="Hero image" name="image" value={values.image} onChange={(v) => set('image', v)} folder="dining" />
            <MediaPickerMulti label="Gallery" name="gallery" values={values.gallery} onChange={(v) => set('gallery', v)} folder="dining" />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Translations</h2>
            <TranslationTabs
              fields={[
                { name: 'name', label: 'Name' },
                { name: 'tagline', label: 'Tagline' },
                { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
                { name: 'hours', label: 'Hours' },
              ]}
              defaults={{ name: values.name, tagline: values.tagline, description: values.description, hours: values.hours }}
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
                  <Trash2 size={14} /> Delete venue
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
