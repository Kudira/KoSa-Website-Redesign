'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField, SelectField, TagInputField } from '@/components/admin/FormField';
import { MediaPickerSingle, MediaPickerMulti } from '@/components/admin/MediaPicker';
import { StatusToggle } from '@/components/admin/StatusToggle';
import { TranslationTabs } from '@/components/admin/TranslationTabs';
import { useToast } from '@/components/admin/Toast';
import type { Locale } from '@/lib/i18n/dictionaries';

export interface RoomFormValues {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  category: 'SUITE' | 'PALM_SIDE' | 'BEACH_VIEW' | 'BUNGALOW' | 'VILLA';
  description: string;
  price: number;
  currency: string;
  maxGuests: number;
  bedConfig: string;
  sizeSqm: number | '';
  image: string;
  gallery: string[];
  amenities: string[];
  features: string[];
  cloudbedsRoomTypeId: string;
  available: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
  translations: Partial<Record<Locale, Record<string, string>>>;
}

const EMPTY: RoomFormValues = {
  slug: '',
  name: '',
  tagline: '',
  category: 'BEACH_VIEW',
  description: '',
  price: 0,
  currency: 'GHS',
  maxGuests: 2,
  bedConfig: '',
  sizeSqm: '',
  image: '',
  gallery: [],
  amenities: [],
  features: [],
  cloudbedsRoomTypeId: '',
  available: true,
  status: 'PUBLISHED',
  sortOrder: 0,
  translations: {},
};

export function RoomForm({ initial }: { initial?: Partial<RoomFormValues> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<RoomFormValues>({ ...EMPTY, ...initial });
  const isNew = !values.id;

  function set<K extends keyof RoomFormValues>(k: K, v: RoomFormValues[K]) {
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
        category: values.category,
        description: values.description || null,
        price: Number(values.price),
        currency: values.currency.toUpperCase(),
        maxGuests: Number(values.maxGuests),
        bedConfig: values.bedConfig || null,
        sizeSqm: values.sizeSqm === '' ? null : Number(values.sizeSqm),
        image: values.image || null,
        gallery: values.gallery,
        amenities: values.amenities,
        features: values.features,
        cloudbedsRoomTypeId: values.cloudbedsRoomTypeId || null,
        available: values.available,
        status: values.status,
        sortOrder: Number(values.sortOrder),
        translations: values.translations,
      };
      const url = isNew ? '/api/admin/rooms' : `/api/admin/rooms/${values.id}`;
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
      toast.push('success', isNew ? 'Room created' : 'Room saved');
      if (isNew && json?.room?.id) {
        startTransition(() => router.push(`/admin/rooms/${json.room.id}`));
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
    if (!confirm('Delete this room? This cannot be undone.')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/rooms/${values.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Delete failed');
      }
      toast.push('success', 'Room deleted');
      startTransition(() => router.push('/admin/rooms'));
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
            <TextField
              label="Name"
              name="name"
              required
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
            />
            <TextField
              label="Slug"
              name="slug"
              value={values.slug}
              onChange={(e) => set('slug', e.target.value)}
              hint="URL fragment, e.g. beachfront-suite. Auto-generated if blank."
            />
            <TextField
              label="Tagline"
              name="tagline"
              value={values.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              hint="Short evocative line shown beneath the name."
            />
            <SelectField
              label="Category"
              name="category"
              value={values.category}
              onChange={(e) => set('category', e.target.value as RoomFormValues['category'])}
              // Labels show the public category each option maps to.
              options={[
                { value: 'BEACH_VIEW', label: 'Sea View' },
                { value: 'SUITE', label: 'Sea View (Suite)' },
                { value: 'BUNGALOW', label: 'Garden View' },
                { value: 'VILLA', label: 'Garden View (Villa)' },
                { value: 'PALM_SIDE', label: 'Palm Side' },
              ]}
            />
            <TextareaField
              label="Description"
              name="description"
              rows={6}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              hint="Markdown/plain text. Shown on the room detail page."
            />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Pricing & capacity</h2>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                type="number"
                step="0.01"
                min="0"
                label="Price / night"
                name="price"
                value={values.price}
                onChange={(e) => set('price', Number(e.target.value))}
                required
              />
              <TextField
                label="Currency"
                name="currency"
                value={values.currency}
                onChange={(e) => set('currency', e.target.value.toUpperCase())}
                maxLength={3}
              />
              <TextField
                type="number"
                min="1"
                label="Max guests"
                name="maxGuests"
                value={values.maxGuests}
                onChange={(e) => set('maxGuests', Number(e.target.value))}
              />
              <TextField
                type="number"
                min="0"
                label="Size (m²)"
                name="sizeSqm"
                value={values.sizeSqm}
                onChange={(e) =>
                  set('sizeSqm', e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </div>
            <TextField
              label="Bed configuration"
              name="bedConfig"
              value={values.bedConfig}
              onChange={(e) => set('bedConfig', e.target.value)}
              hint='e.g. "King size bed with linen sheets"'
            />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Imagery</h2>
            <MediaPickerSingle
              label="Hero image"
              name="image"
              value={values.image}
              onChange={(v) => set('image', v)}
              folder="rooms"
            />
            <MediaPickerMulti
              label="Gallery"
              name="gallery"
              values={values.gallery}
              onChange={(v) => set('gallery', v)}
              folder="rooms"
            />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Amenities & features</h2>
            <TagInputField
              label="Amenities"
              name="amenities"
              values={values.amenities}
              onChange={(v) => set('amenities', v)}
              placeholder="e.g. King-size bed"
            />
            <TagInputField
              label="Features"
              name="features"
              values={values.features}
              onChange={(v) => set('features', v)}
              placeholder="e.g. Ocean view"
            />
          </section>

          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4">
            <h2 className="font-belleza text-xl text-umber">Translations</h2>
            <p className="text-xs text-umber/60">
              English content lives in the fields above. Optional translations overlay the visible
              text per locale. Blank fields fall back to English.
            </p>
            <TranslationTabs
              fields={[
                { name: 'name', label: 'Name' },
                { name: 'tagline', label: 'Tagline' },
                { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
                { name: 'bedConfig', label: 'Bed configuration' },
              ]}
              defaults={{
                name: values.name,
                tagline: values.tagline,
                description: values.description,
                bedConfig: values.bedConfig,
              }}
              value={values.translations}
              onChange={(v) => set('translations', v)}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-cream rounded-md p-6 border border-warm-grey/40 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
                Status
              </h2>
              <StatusToggle value={values.status} onChange={(v) => set('status', v)} />
            </div>
            <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-warm-grey/30">
              <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
                Availability
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-umber">
                <input
                  type="checkbox"
                  checked={values.available}
                  onChange={(e) => set('available', e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {values.available ? 'Available' : 'Occupied'}
              </span>
            </label>
            <TextField
              type="number"
              label="Sort order"
              name="sortOrder"
              value={values.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
              hint="Lower numbers appear first."
            />
            <TextField
              label="Cloudbeds room-type ID"
              name="cloudbedsRoomTypeId"
              value={values.cloudbedsRoomTypeId}
              onChange={(e) => set('cloudbedsRoomTypeId', e.target.value)}
              hint="Optional link this room to a Cloudbeds room type."
            />
            <div className="pt-4 border-t border-warm-grey/30 space-y-2">
              <Button type="submit" disabled={submitting || pending} className="w-full">
                <Save size={14} /> {isNew ? 'Create room' : 'Save changes'}
              </Button>
              {!isNew && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  disabled={submitting}
                  className="w-full"
                >
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
