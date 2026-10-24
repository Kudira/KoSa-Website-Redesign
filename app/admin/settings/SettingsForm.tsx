'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { TextField, TextareaField } from '@/components/admin/FormField';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { useToast } from '@/components/admin/Toast';
import { cn } from '@/lib/utils';

type SectionKey = 'hero' | 'contact' | 'seo' | 'integrations' | 'pricing' | 'maintenance';

interface Props {
  initial: Record<SectionKey, Record<string, unknown>>;
}

const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  { key: 'hero', label: 'Hero', description: 'Headline, tagline and CTAs on the home page.' },
  { key: 'contact', label: 'Contact & social', description: 'Email, phone, address, social profiles.' },
  { key: 'seo', label: 'SEO & branding', description: 'Default meta titles, OG image, social handles.' },
  { key: 'integrations', label: 'Integrations', description: 'Property IDs, analytics IDs, feature toggles.' },
  { key: 'pricing', label: 'Pricing visibility', description: 'Show or hide prices on the public website.' },
  { key: 'maintenance', label: 'Maintenance', description: 'Temporarily display a maintenance banner.' },
];

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<SectionKey>('hero');
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Record<SectionKey, Record<string, unknown>>>(initial);

  function update(key: SectionKey, field: string, v: unknown) {
    setValues((s) => ({ ...s, [key]: { ...s[key], [field]: v } }));
  }

  async function save(key: SectionKey) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values[key]),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Save failed');
      }
      toast.push('success', `${key} settings saved`);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <nav className="space-y-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
              active === s.key ? 'bg-primary/20 text-umber font-medium' : 'text-umber/70 hover:bg-umber/5',
            )}
          >
            <span className="block">{s.label}</span>
            <span className="block text-[10px] text-umber/50">{s.description}</span>
          </button>
        ))}
      </nav>

      <div className="bg-cream border border-warm-grey/40 rounded-md p-6 space-y-4">
        {active === 'hero' && <HeroSection values={values.hero} onChange={(f, v) => update('hero', f, v)} />}
        {active === 'contact' && <ContactSection values={values.contact} onChange={(f, v) => update('contact', f, v)} />}
        {active === 'seo' && <SeoSection values={values.seo} onChange={(f, v) => update('seo', f, v)} />}
        {active === 'integrations' && (
          <IntegrationsSection values={values.integrations} onChange={(f, v) => update('integrations', f, v)} />
        )}
        {active === 'pricing' && (
          <PricingSection values={values.pricing} onChange={(f, v) => update('pricing', f, v)} />
        )}
        {active === 'maintenance' && (
          <MaintenanceSection values={values.maintenance} onChange={(f, v) => update('maintenance', f, v)} />
        )}
        <div className="pt-4 border-t border-warm-grey/30">
          <Button type="button" onClick={() => save(active)} disabled={busy || pending}>
            <Save size={14} /> Save {active}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Section components ──────────────────────────────────────────────────

function asStr(v: unknown) {
  return typeof v === 'string' ? v : '';
}
function asBool(v: unknown, fallback = false) {
  return typeof v === 'boolean' ? v : fallback;
}

function HeroSection({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (field: string, v: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">Hero</h2>
      <TextField label="Headline" name="headline" value={asStr(values.headline)} onChange={(e) => onChange('headline', e.target.value)} />
      <TextField label="Tagline" name="tagline" value={asStr(values.tagline)} onChange={(e) => onChange('tagline', e.target.value)} />
      <TextField label="Location line" name="location" value={asStr(values.location)} onChange={(e) => onChange('location', e.target.value)} />
      <MediaPickerSingle label="Hero poster image" name="posterUrl" value={asStr(values.posterUrl)} onChange={(v) => onChange('posterUrl', v)} folder="hero" />
      <TextField label="Hero video URL (optional)" name="videoUrl" value={asStr(values.videoUrl)} onChange={(e) => onChange('videoUrl', e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Primary CTA label" name="ctaPrimaryLabel" value={asStr(values.ctaPrimaryLabel)} onChange={(e) => onChange('ctaPrimaryLabel', e.target.value)} />
        <TextField label="Primary CTA href" name="ctaPrimaryHref" value={asStr(values.ctaPrimaryHref)} onChange={(e) => onChange('ctaPrimaryHref', e.target.value)} />
        <TextField label="Secondary CTA label" name="ctaSecondaryLabel" value={asStr(values.ctaSecondaryLabel)} onChange={(e) => onChange('ctaSecondaryLabel', e.target.value)} />
        <TextField label="Secondary CTA href" name="ctaSecondaryHref" value={asStr(values.ctaSecondaryHref)} onChange={(e) => onChange('ctaSecondaryHref', e.target.value)} />
      </div>
    </div>
  );
}

function ContactSection({ values, onChange }: { values: Record<string, unknown>; onChange: (f: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">Contact & social</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField type="email" label="Email" name="email" value={asStr(values.email)} onChange={(e) => onChange('email', e.target.value)} />
        <TextField label="Phone" name="phone" value={asStr(values.phone)} onChange={(e) => onChange('phone', e.target.value)} />
        <TextField label="WhatsApp" name="whatsapp" value={asStr(values.whatsapp)} onChange={(e) => onChange('whatsapp', e.target.value)} hint="With country code, no '+'" />
        <TextField label="Instagram URL" name="instagram" value={asStr(values.instagram)} onChange={(e) => onChange('instagram', e.target.value)} />
        <TextField label="Facebook URL" name="facebook" value={asStr(values.facebook)} onChange={(e) => onChange('facebook', e.target.value)} />
        <TextField label="TripAdvisor URL" name="tripadvisor" value={asStr(values.tripadvisor)} onChange={(e) => onChange('tripadvisor', e.target.value)} />
        <TextField label="YouTube URL" name="youtube" value={asStr(values.youtube)} onChange={(e) => onChange('youtube', e.target.value)} />
      </div>
      <TextareaField label="Address" name="address" rows={2} value={asStr(values.address)} onChange={(e) => onChange('address', e.target.value)} />
    </div>
  );
}

function SeoSection({ values, onChange }: { values: Record<string, unknown>; onChange: (f: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">SEO & branding</h2>
      <TextField label="Site title" name="siteTitle" value={asStr(values.siteTitle)} onChange={(e) => onChange('siteTitle', e.target.value)} />
      <TextareaField label="Site description" name="siteDescription" rows={3} value={asStr(values.siteDescription)} onChange={(e) => onChange('siteDescription', e.target.value)} />
      <MediaPickerSingle label="Default OG image" name="ogImage" value={asStr(values.ogImage)} onChange={(v) => onChange('ogImage', v)} folder="seo" />
      <TextField label="Twitter handle" name="twitterHandle" value={asStr(values.twitterHandle)} onChange={(e) => onChange('twitterHandle', e.target.value)} hint="With @" />
    </div>
  );
}

function IntegrationsSection({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (f: string, v: unknown) => void;
}) {
  const toggleRow = (label: string, key: string, dflt = true) => (
    <label className="flex items-center justify-between p-3 bg-bg-orange rounded-md">
      <span className="text-sm text-umber">{label}</span>
      <input
        type="checkbox"
        checked={asBool(values[key], dflt)}
        onChange={(e) => onChange(key, e.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">Integrations</h2>
      <TextField label="Cloudbeds property ID" name="cloudbedsPropertyId" value={asStr(values.cloudbedsPropertyId)} onChange={(e) => onChange('cloudbedsPropertyId', e.target.value)} />
      <TextField type="email" label="Resend 'from' email" name="resendFromEmail" value={asStr(values.resendFromEmail)} onChange={(e) => onChange('resendFromEmail', e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Google Analytics ID" name="googleAnalyticsId" value={asStr(values.googleAnalyticsId)} onChange={(e) => onChange('googleAnalyticsId', e.target.value)} />
        <TextField label="GTM container ID" name="googleTagManagerId" value={asStr(values.googleTagManagerId)} onChange={(e) => onChange('googleTagManagerId', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {toggleRow('Booking enabled', 'bookingEnabled')}
        {toggleRow('Chat enabled', 'chatEnabled')}
        {toggleRow('Newsletter enabled', 'newsletterEnabled')}
      </div>
      <p className="text-xs text-umber/60">
        Note: API keys and other secrets are read from environment variables they're never stored in
        the database.
      </p>
    </div>
  );
}

function PricingSection({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (f: string, v: unknown) => void;
}) {
  const toggleRow = (label: string, hint: string, key: string) => (
    <label className="flex items-center justify-between gap-4 p-3 bg-bg-orange rounded-md">
      <span>
        <span className="block text-sm text-umber">{label}</span>
        <span className="block text-[11px] text-umber/55">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={asBool(values[key], false)}
        onChange={(e) => onChange(key, e.target.checked)}
        className="h-5 w-5 shrink-0"
      />
    </label>
  );
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">Pricing visibility</h2>
      <p className="text-sm text-umber/70">
        Hide prices on the public website without deleting any data. Prices stay saved and reappear
        the moment you switch a toggle back off.
      </p>
      <div className="space-y-2">
        {toggleRow(
          'Hide room prices',
          'Hides the "From GHS X per night" line on the rooms list, room pages and the home page.',
          'hideRoomPrices',
        )}
        {toggleRow(
          'Hide wellness prices',
          'Hides spa treatment prices (KoSa Health Spa & O2 Wellness) on the Wellness page.',
          'hideWellnessPrices',
        )}
        {toggleRow(
          'Hide experiences & activities prices',
          'Hides Experiences & Celebrations and Activities & Excursions prices in the "Enhance Your Stay" section.',
          'hideEnhancementPrices',
        )}
      </div>
    </div>
  );
}

function MaintenanceSection({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (f: string, v: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-belleza text-xl text-umber">Maintenance mode</h2>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={asBool(values.enabled)}
          onChange={(e) => onChange('enabled', e.target.checked)}
          className="h-5 w-5"
        />
        <span className="text-sm text-umber">Enable maintenance banner</span>
      </label>
      <TextareaField
        label="Banner message"
        name="message"
        rows={3}
        value={asStr(values.message)}
        onChange={(e) => onChange('message', e.target.value)}
      />
    </div>
  );
}
