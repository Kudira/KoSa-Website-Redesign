'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ExternalLink, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { MediaPickerSingle } from '@/components/admin/MediaPicker';
import { useToast } from '@/components/admin/Toast';
import { cn } from '@/lib/utils';

export interface EditorFieldView {
  id: string;
  scope: 'text' | 'value';
  key: string;
  section: string;
  label: string;
  kind: 'text' | 'longtext' | 'image' | 'video' | 'number';
  builtIn: string;
  current: string;
  translatable: boolean;
}

interface Props {
  pageId: string;
  pagePath: string;
  locale: string;
  languages: { code: string; label: string }[];
  fields: EditorFieldView[];
}

export function PageEditor({ pageId, pagePath, locale, languages, fields }: Props) {
  const router = useRouter();
  const toast = useToast();
  // What each field shows now: the admin's edit, or the built-in wording.
  const initial = useMemo(() => Object.fromEntries(fields.map((f) => [f.id, f.current || f.builtIn])), [fields]);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);

  const visible = locale === 'en' ? fields : fields.filter((f) => f.translatable);
  const sections = useMemo(() => {
    const map = new Map<string, EditorFieldView[]>();
    for (const f of visible) map.set(f.section, [...(map.get(f.section) ?? []), f]);
    return Array.from(map.entries());
  }, [visible]);

  const changed = visible.filter((f) => (values[f.id] ?? '') !== (initial[f.id] ?? ''));

  async function save() {
    if (!changed.length) return;
    setSaving(true);
    const texts: Record<string, string | null> = {};
    const vals: Record<string, string | null> = {};
    for (const f of changed) {
      const v = values[f.id] ?? '';
      // Matching the built-in wording (or empty) removes the edit.
      const out = v.trim() === '' || v === f.builtIn ? null : v;
      if (f.scope === 'text') texts[f.key] = out;
      else vals[f.key] = out;
    }
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, texts, values: vals }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || 'Saving failed');
      toast.push('success', `Saved ${changed.length} change${changed.length > 1 ? 's' : ''}. The website updates within about 15 seconds.`);
      router.refresh();
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-md bg-umber/5 p-1">
          {languages.map((l) => (
            <Link
              key={l.code}
              href={`/admin/pages/${pageId}${l.code === 'en' ? '' : `?lang=${l.code}`}`}
              className={cn('rounded px-3 py-1.5 text-sm', l.code === locale ? 'bg-cream font-medium text-umber shadow-sm' : 'text-umber/60 hover:text-umber')}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <a href={pagePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          View this page <ExternalLink size={14} />
        </a>
      </div>
      {locale !== 'en' && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-umber/80">
          You are editing the {languages.find((l) => l.code === locale)?.label} wording. Photos, films and prices are the same in every language and are changed on the English tab.
        </p>
      )}

      {sections.map(([section, items]) => (
        <details key={section} id={encodeURIComponent(section)} open={sections.length <= 4} className="rounded-md border border-warm-grey/40 bg-cream">
          <summary className="cursor-pointer select-none px-5 py-4 font-belleza text-xl text-umber">
            {section}
            <span className="ml-2 font-sans text-xs text-umber/50">{items.length} items</span>
          </summary>
          <div className="space-y-6 border-t border-warm-grey/30 px-5 py-5">
            {items.map((f) => {
              const v = values[f.id] ?? '';
              const isEdited = (f.current && v !== f.builtIn) || (!f.current && v !== f.builtIn);
              const set = (next: string) => setValues((s) => ({ ...s, [f.id]: next }));
              return (
                <div key={f.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-umber">
                      {f.label}
                      {isEdited && <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Changed</span>}
                    </span>
                    {isEdited && (
                      <button type="button" onClick={() => set(f.builtIn)} className="inline-flex items-center gap-1 text-xs text-umber/60 hover:text-primary">
                        <RotateCcw size={12} /> Reset
                      </button>
                    )}
                  </div>
                  {f.kind === 'image' ? (
                    <MediaPickerSingle label="" name={f.id} value={v} onChange={set} folder="pages" />
                  ) : f.kind === 'video' ? (
                    <input value={v} onChange={(e) => set(e.target.value)} placeholder="Paste a film link (upload it in Media first)" className="w-full rounded-md border border-warm-grey/50 bg-white px-3 py-2.5 text-sm" />
                  ) : f.kind === 'number' ? (
                    <input type="number" min={0} value={v} onChange={(e) => set(e.target.value)} className="w-40 rounded-md border border-warm-grey/50 bg-white px-3 py-2.5 text-sm" />
                  ) : f.kind === 'longtext' ? (
                    <textarea value={v} onChange={(e) => set(e.target.value)} rows={Math.min(14, Math.max(3, Math.ceil(v.length / 90)))} className="w-full rounded-md border border-warm-grey/50 bg-white px-3 py-2.5 text-sm leading-relaxed" />
                  ) : (
                    <input value={v} onChange={(e) => set(e.target.value)} className="w-full rounded-md border border-warm-grey/50 bg-white px-3 py-2.5 text-sm" />
                  )}
                  {f.kind === 'longtext' && f.key.startsWith('text.') && f.key.endsWith('.body') && (
                    <p className="mt-1 text-xs text-umber/50">Start a line with “## ” for a heading or “- ” for a bullet. Leave a blank line between paragraphs.</p>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-grey/40 bg-cream/95 px-4 py-3 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-sm text-umber/70">{changed.length ? `${changed.length} unsaved change${changed.length > 1 ? 's' : ''}` : 'No unsaved changes'}</p>
          <div className="flex gap-2">
            {changed.length > 0 && (
              <Button type="button" variant="ghost" onClick={() => setValues(initial)} disabled={saving}>
                Undo
              </Button>
            )}
            <Button type="button" onClick={save} disabled={!changed.length || saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
