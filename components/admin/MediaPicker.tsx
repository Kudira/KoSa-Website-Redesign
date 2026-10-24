'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, ImagePlus } from 'lucide-react';
import { FieldShell } from './FormField';
import { uploadMedia } from '@/lib/admin/uploadMedia';

interface SingleProps {
  label: string;
  name: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  folder?: string;
}

/**
 * Single image picker. Accepts a URL paste *or* a file upload that goes to
 * /api/admin/upload. Saves the public URL.
 */
export function MediaPickerSingle({ label, name, value, onChange, hint, folder }: SingleProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(raw: File) {
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadMedia(raw, { folder });
      onChange(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldShell label={label} name={name} hint={hint} error={error || undefined}>
      <div className="space-y-3">
        {value && (
          <div className="relative w-full max-w-md aspect-[16/10] rounded-md overflow-hidden bg-sand-light">
            <Image src={value} alt={label} fill sizes="400px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 grid place-items-center h-8 w-8 rounded-full bg-umber/80 text-cream hover:bg-red-600"
              aria-label="Remove image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or upload below"
            className="flex-1 bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-poppins uppercase tracking-tracked-sm border border-umber/30 rounded-md text-umber hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {uploading ? (
              'Uploading…'
            ) : (
              <>
                <Upload size={14} /> Upload
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*,.heic,.heif,video/*,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </FieldShell>
  );
}

interface MultiProps {
  label: string;
  name: string;
  values: string[];
  onChange: (next: string[]) => void;
  hint?: string;
  folder?: string;
}

export function MediaPickerMulti({ label, name, values, onChange, hint, folder }: MultiProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState('');

  async function onFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const next = [...values];
    try {
      for (const raw of Array.from(files)) {
        const { url } = await uploadMedia(raw, { folder });
        next.push(url);
      }
      onChange(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addByUrl() {
    const v = pasteUrl.trim();
    if (!v) return;
    onChange([...values, v]);
    setPasteUrl('');
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...values];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <FieldShell label={label} name={name} hint={hint} error={error || undefined}>
      <div className="space-y-3">
        {values.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {values.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-[4/3] rounded-md overflow-hidden bg-sand-light group">
                <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-0 bg-umber/0 group-hover:bg-umber/40 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-1 flex items-center justify-between bg-umber/70 text-cream opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="text-[10px] px-1 hover:text-primary disabled:opacity-30"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="text-[10px] px-1 hover:text-primary disabled:opacity-30"
                      onClick={() => move(i, 1)}
                      disabled={i === values.length - 1}
                      aria-label="Move right"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] hover:text-red-300"
                    onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                    aria-label="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addByUrl();
              }
            }}
            placeholder="Paste image URL and press enter"
            className="flex-1 bg-cream border border-warm-grey/40 focus:border-primary focus:outline-none rounded-md px-3 py-2 text-sm text-umber"
          />
          <button
            type="button"
            onClick={addByUrl}
            className="px-3 py-2 text-xs font-poppins uppercase tracking-tracked-sm border border-umber/30 rounded-md text-umber hover:border-primary hover:text-primary"
          >
            Add URL
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-poppins uppercase tracking-tracked-sm border border-umber/30 rounded-md text-umber hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : (
              <>
                <ImagePlus size={14} /> Upload
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,.heic,.heif"
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </FieldShell>
  );
}
