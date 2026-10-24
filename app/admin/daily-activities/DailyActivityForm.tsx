'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { useToast } from '@/components/admin/Toast';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as const;
type Day = (typeof DAYS)[number];

export interface DailyActivityFormValues {
  id?: string;
  day: Day;
  time: string;
  title: string;
  description: string;
  tag: string;
  image: string;
  isFree: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

const EMPTY: DailyActivityFormValues = {
  day: 'MONDAY', time: '8:00 AM', title: '', description: '', tag: '', image: '',
  isFree: true, status: 'PUBLISHED', sortOrder: 0,
};

export function DailyActivityForm({ initial }: { initial?: Partial<DailyActivityFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<DailyActivityFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof DailyActivityFormValues>(k: K, v: DailyActivityFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const method = isNew ? 'POST' : 'PATCH';
    const url = isNew ? '/api/admin/daily-activities' : `/api/admin/daily-activities/${values.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, image: values.image || null, sortOrder: Number(values.sortOrder) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to save');
      }
      toast.push('success', isNew ? 'Activity created' : 'Activity updated');
      startTransition(() => router.push('/admin/daily-activities'));
      router.refresh();
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!values.id || !confirm('Delete this activity?')) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/daily-activities/${values.id}`, { method: 'DELETE' });
      toast.push('success', 'Activity deleted');
      startTransition(() => router.push('/admin/daily-activities'));
      router.refresh();
    } catch { toast.push('error', 'Delete failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Day" name="day"
          value={values.day}
          onChange={(e) => set('day', e.target.value as Day)}
          options={DAYS.map((d) => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() }))}
        />
        <TextField label="Time" name="time" value={values.time}
          onChange={(e) => set('time', e.target.value)}
          placeholder="8:00 AM" required />
      </div>
      <TextField label="Activity Title" name="title" value={values.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="Morning Beach Yoga" required />
      <TextareaField label="Description" name="description" value={values.description}
        onChange={(e) => set('description', e.target.value)}
        rows={4} placeholder="A gentle flow session on the sand..." required />
      <TextField label="Tag / Callout (optional)" name="tag" value={values.tag}
        onChange={(e) => set('tag', e.target.value)}
        placeholder="All levels welcome, just bring yourself." />
      <MediaPickerSingle label="Day card image (optional)" name="image" value={values.image}
        onChange={(v) => set('image', v)} folder="experiences"
        hint="Shown as the banner on this day's card in the Free Daily Activities rail. The first activity of a day that has an image is used." />
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isFree" checked={values.isFree}
          onChange={(e) => set('isFree', e.target.checked)}
          className="h-4 w-4 rounded border-warm-grey text-primary" />
        <label htmlFor="isFree" className="text-sm text-umber/80 font-opensans">Free activity</label>
      </div>
      <TextField label="Sort Order" name="sortOrder" value={String(values.sortOrder)}
        onChange={(e) => set('sortOrder', Number(e.target.value))} type="number" />
      <StatusToggle value={values.status} onChange={(v) => set('status', v)} />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          <Save size={16} className="mr-2" />
          {submitting ? 'Saving...' : isNew ? 'Create Activity' : 'Save Changes'}
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
