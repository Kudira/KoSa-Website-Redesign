'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField } from '@/components/admin/FormField';
import { MediaPickerSingle, MediaPickerMulti } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { useToast } from '@/components/admin/Toast';
import type { Locale } from '@/lib/i18n/dictionaries';

export interface ExperienceFormValues {
  id?: string;
  slug: string;
  label: string;
  title: string;
  description: string;
  longBody: string;
  image: string;
  gallery: string[];
  adinkra: string;
  duration: string;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
  translations: Partial<Record<Locale, Record<string, string>>>;
}

const EMPTY: ExperienceFormValues = {
  slug: '',
  label: '',
  title: '',
  description: '',
  longBody: '',
  image: '',
  gallery: [],
  adinkra: '',
  duration: '',
  status: 'PUBLISHED',
  sortOrder: 0,
  translations: {},
};

const ADINKRA_OPTIONS = [
  { value: '', label: '-' },
  { value: 'knonsonkonson', label: 'Knonsonkonson · Belong' },
  { value: 'asetena', label: 'Asetena Pa · Good Life' },
  { value: 'denkyem', label: 'Denkyem · Breathe' },
  { value: 'community', label: 'Nkabom · Togetherness' },
  { value: 'palm', label: 'Palm' },
];

export function ExperienceForm({ initial }: { initial?: Partial<ExperienceFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<ExperienceFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof ExperienceFormValues>(k: K, v: ExperienceFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug || undefined,
        label: values.label,
        title: values.title,
        description: values.description,
        longBody: values.longBody || null,
        image: values.image || null,
        gallery: values.gallery,
        adinkra: values.adinkra || null,
        duration: values.duration || null,
        status: values.status,
        sortOrder: Number(values.sortOrder),
        translations: values.translations,
      };
      const url = isNew ? '/api/admin/experiences' : `/api/admin/experiences/${values.id}`;
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
      toast.push('success', isNew ? 'Experience created' : 'Saved');
      if (isNew && json?.experience?.id) {
        startTransition(() => router.push(`/admin/experiences/${json.experience.id}`));
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
    if (!confirm('Delete this experience?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/experiences/${values.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.push('success', 'Deleted');
      startTransition(() => router.push('/admin/experiences'));
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
            <TextField label="Label" name="label" required value={values.label} onChange={(e) => set('label', e.target.value)} hint='Short tag (e.g. "Wellness", "Dining")' />
            <TextField label="Title" name="title" required value={values.title} onChange={(e) => set('title', e.target.value)} />
            <TextField label="Slug" name="slug" value={values.slug} onChange={(e) => set('slug', e.target.value)} hint="Auto-generated if blank." />
            <TextareaField label="Description" name="description" required rows={4} value={values.description} onChange={(e) => set('description', e.target.value)} hint="Card text." />
            <TextareaField label="Long body" name="longBody" rows={10} value={values.longBody} onChange={(e) => set('longBody', e.target.value)} hint="Optional for the detail page." />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Adinkra" name="adinkra" value={values.adinkra} onChange={(e) => set('adinkra', e.target.value)} options={ADINKRA_OPTIONS} />
              <TextField label="Duration" name="duration" value={values.duration} onChange={(e) => set('duration', e.target.value)} hint="Free-text e.g. '2 hours'." />
            </div>
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Imagery</h2>
            <MediaPickerSingle label="Hero image" name="image" value={values.image} onChange={(v) => set('image', v)} folder="experiences" />
            <MediaPickerMulti label="Gallery" name="gallery" values={values.gallery} onChange={(v) => set('gallery', v)} folder="experiences" />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Translations</h2>
            <TranslationTabs
              fields={[
                { name: 'label', label: 'Label' },
                { name: 'title', label: 'Title' },
                { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
                { name: 'longBody', label: 'Long body', type: 'textarea', rows: 8 },
                { name: 'duration', label: 'Duration' },
              ]}
              defaults={{
                label: values.label,
                title: values.title,
                description: values.description,
                longBody: values.longBody,
                duration: values.duration,
              }}
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
