'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, TagInputField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { useToast } from '@/components/admin/Toast';
import type { Locale } from '@/lib/i18n/dictionaries';

export interface JournalFormValues {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  translations: Partial<Record<Locale, Record<string, string>>>;
}

const EMPTY: JournalFormValues = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  image: '',
  author: '',
  tags: [],
  status: 'DRAFT',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  translations: {},
};

function toIsoLocal(d?: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  // Strip seconds + tz to fit <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function JournalForm({ initial }: { initial?: Partial<JournalFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<JournalFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof JournalFormValues>(k: K, v: JournalFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug || undefined,
        title: values.title,
        excerpt: values.excerpt || null,
        body: values.body,
        image: values.image || null,
        author: values.author || null,
        tags: values.tags,
        status: values.status,
        publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
        seoTitle: values.seoTitle || null,
        seoDescription: values.seoDescription || null,
        translations: values.translations,
      };
      const url = isNew ? '/api/admin/journal' : `/api/admin/journal/${values.id}`;
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
      toast.push('success', isNew ? 'Post created' : 'Saved');
      if (isNew && json?.post?.id) {
        startTransition(() => router.push(`/admin/journal/${json.post.id}`));
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
    if (!confirm('Delete this post?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/journal/${values.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.push('success', 'Deleted');
      startTransition(() => router.push('/admin/journal'));
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
            <h2 className="font-belleza text-xl text-umber">Post</h2>
            <TextField label="Title" name="title" required value={values.title} onChange={(e) => set('title', e.target.value)} />
            <TextField label="Slug" name="slug" value={values.slug} onChange={(e) => set('slug', e.target.value)} hint="Used in /blog/<slug>" />
            <TextareaField label="Excerpt" name="excerpt" rows={3} value={values.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            <TextareaField
              label="Body (HTML)"
              name="body"
              rows={18}
              required
              value={values.body}
              onChange={(e) => set('body', e.target.value)}
              hint="HTML markup is preserved. Supports <p>, <h2>, <a>, <ul>, etc."
            />
            <TextField label="Author" name="author" value={values.author} onChange={(e) => set('author', e.target.value)} />
            <TagInputField label="Tags" name="tags" values={values.tags} onChange={(v) => set('tags', v)} />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Hero image</h2>
            <MediaPickerSingle label="Image" name="image" value={values.image} onChange={(v) => set('image', v)} folder="journal" />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">SEO</h2>
            <TextField label="SEO title" name="seoTitle" value={values.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} hint="Falls back to the post title." />
            <TextareaField label="SEO description" name="seoDescription" rows={3} value={values.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Translations</h2>
            <TranslationTabs
              fields={[
                { name: 'title', label: 'Title' },
                { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3 },
                { name: 'body', label: 'Body (HTML)', type: 'textarea', rows: 10 },
                { name: 'seoTitle', label: 'SEO title' },
                { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 3 },
              ]}
              defaults={{
                title: values.title,
                excerpt: values.excerpt,
                body: values.body,
                seoTitle: values.seoTitle,
                seoDescription: values.seoDescription,
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
            <TextField
              type="datetime-local"
              label="Publish date"
              name="publishedAt"
              value={values.publishedAt ? toIsoLocal(values.publishedAt) : ''}
              onChange={(e) => set('publishedAt', e.target.value)}
              hint="Set to a future date to schedule."
            />
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
