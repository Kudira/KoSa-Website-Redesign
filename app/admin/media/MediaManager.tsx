'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';
import { uploadMedia } from '@/lib/admin/uploadMedia';

interface Asset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string | null;
  folder: string | null;
  createdAt: string;
}

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager({ initial }: { initial: Asset[] }) {
  const toast = useToast();
  const [items, setItems] = useState<Asset[]>(initial);
  const [busy, setBusy] = useState(false);
  const [folder, setFolder] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const visible = items.filter((i) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      i.filename.toLowerCase().includes(q) ||
      (i.alt?.toLowerCase().includes(q) ?? false) ||
      (i.folder?.toLowerCase().includes(q) ?? false)
    );
  });

  async function upload(files: FileList) {
    setBusy(true);
    try {
      const newOnes: Asset[] = [];
      for (const file of Array.from(files)) {
        const j = await uploadMedia(file, { folder: folder.trim() || undefined });
        newOnes.push({
          id: j.id,
          url: j.url,
          filename: j.filename,
          mimeType: j.mimeType,
          size: j.size,
          alt: null,
          folder: folder.trim() || null,
          createdAt: new Date().toISOString(),
        });
      }
      setItems((s) => [...newOnes, ...s]);
      toast.push('success', `${newOnes.length} file${newOnes.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this file permanently?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setItems((s) => s.filter((i) => i.id !== id));
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function patch(id: string, body: Partial<Asset>) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      setItems((s) => s.map((x) => (x.id === id ? { ...x, ...body } as Asset : x)));
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-cream border border-warm-grey/40 rounded-md p-4 grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename, alt, folder…"
          className="bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Folder (optional)"
          className="bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm"
        />
        <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload size={14} /> Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {visible.length === 0 ? (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center text-umber/60 text-sm">
          {items.length === 0 ? 'No files yet.' : 'No matching files.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map((it) => (
            <article key={it.id} className="bg-cream border border-warm-grey/40 rounded-md overflow-hidden">
              <div className="relative aspect-square bg-sand-light">
                {it.mimeType.startsWith('image/') ? (
                  <Image src={it.url} alt={it.alt ?? it.filename} fill sizes="240px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-xs font-poppins uppercase tracking-tracked text-umber/60">
                    {it.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium text-umber truncate" title={it.filename}>
                  {it.filename}
                </p>
                <p className="text-[10px] text-umber/50">
                  {fmtSize(it.size)} · {it.folder || 'uploads'}
                </p>
                <input
                  defaultValue={it.alt ?? ''}
                  onBlur={(e) => patch(it.id, { alt: e.target.value || null })}
                  placeholder="Alt text"
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-2 py-1 text-xs"
                />
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="secondary" onClick={() => copyUrl(it.url)} className="flex-1">
                    {copied === it.url ? <Check size={12} /> : <Copy size={12} />}
                    {copied === it.url ? 'Copied' : 'Copy URL'}
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => remove(it.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
