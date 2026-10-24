'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { useToast } from '@/components/admin/Toast';
import { EVENT_CATEGORIES } from '@/lib/cms/events';

export interface EventFormValues {
  id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  transportIncluded: boolean;
  priceNote: string;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

const EMPTY: EventFormValues = {
  slug: '', title: '', category: EVENT_CATEGORIES[0], description: '',
  image: '', transportIncluded: false, priceNote: '', status: 'PUBLISHED', sortOrder: 0,
};

export function EventForm({ initial }: { initial?: Partial<EventFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<EventFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof EventFormValues>(k: K, v: EventFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function autoSlug(title: string) {
    if (!isNew) return;
    set('slug', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const method = isNew ? 'POST' : 'PATCH';
    const url = isNew ? '/api/admin/events' : `/api/admin/events/${values.id}`;
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          image: values.image || null,
          priceNote: values.priceNote || null,
          sortOrder: Number(values.sortOrder),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      toast.push('success', isNew ? 'Event created' : 'Event updated');
      startTransition(() => router.push('/admin/events'));
      router.refresh();
    } catch (e) { toast.push('error', (e as Error).message); }
    finally { setSubmitting(false); }
  }

  async function onDelete() {
    if (!values.id || !confirm('Delete this event?')) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/events/${values.id}`, { method: 'DELETE' });
      toast.push('success', 'Event deleted');
      startTransition(() => router.push('/admin/events'));
      router.refresh();
    } catch { toast.push('error', 'Delete failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <TextField label="Title" name="title" value={values.title}
        onChange={(e) => { set('title', e.target.value); autoSlug(e.target.value); }}
        placeholder="Drumming and Dancing" required />
      <TextField label="Slug" name="slug" value={values.slug}
        onChange={(e) => set('slug', e.target.value)} placeholder="drumming-and-dancing" required />
      <SelectField label="Category" name="category" value={values.category}
        onChange={(e) => set('category', e.target.value)}
        options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
      <TextareaField label="Description" name="description" value={values.description}
        onChange={(e) => set('description', e.target.value)} rows={3}
        placeholder="Immerse yourself in traditional Ghanaian rhythms and movements." required />
      <MediaPickerSingle label="Image" name="image" value={values.image}
        onChange={(v) => set('image', v)} folder="events"
        hint="Photo shown on the event card." />
      <TextField label="Price note (optional)" name="priceNote" value={values.priceNote}
        onChange={(e) => set('priceNote', e.target.value)} placeholder="From GHS 600 per person / On request" />
      <div className="flex items-center gap-3">
        <input type="checkbox" id="transport" checked={values.transportIncluded}
          onChange={(e) => set('transportIncluded', e.target.checked)}
          className="h-4 w-4 rounded border-warm-grey text-primary" />
        <label htmlFor="transport" className="text-sm text-umber/80 font-opensans">Transportation included</label>
      </div>
      <TextField label="Sort Order" name="sortOrder" value={String(values.sortOrder)}
        onChange={(e) => set('sortOrder', Number(e.target.value))} type="number" />
      <StatusToggle value={values.status} onChange={(v) => set('status', v)} />
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          <Save size={16} className="mr-2" />
          {submitting ? 'Saving...' : isNew ? 'Create Event' : 'Save Changes'}
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
