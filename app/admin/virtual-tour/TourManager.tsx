'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';
import { StatusBadge } from '@/components/admin/DataTable';
import { uploadMedia } from '@/lib/admin/uploadMedia';

interface Scene {
  id: string;
  sceneId: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  sortOrder: number;
}

export function TourManager({ initial }: { initial: Scene[] }) {
  const toast = useToast();
  const [scenes, setScenes] = useState<Scene[]>(initial);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingUrl, setPendingUrl] = useState('');

  async function create(name: string, imageUrl: string) {
    if (!name.trim() || !imageUrl.trim()) {
      toast.push('error', 'Name and image URL required');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/virtual-tour', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          imageUrl,
          status: 'PUBLISHED',
          sortOrder: scenes.length,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Failed');
      setScenes((s) => [...s, j.scene]);
      setPendingName('');
      setPendingUrl('');
      toast.push('success', 'Scene added');
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadAndCreate(files: FileList, name: string) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadMedia(file, { folder: 'virtual-tour' });
        const sceneName = name || file.name.replace(/\.[^.]+$/, '');
        await create(sceneName, url);
      }
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, patch: Partial<Scene>) {
    setScenes((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      const res = await fetch(`/api/admin/virtual-tour/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this scene?')) return;
    try {
      const res = await fetch(`/api/admin/virtual-tour/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setScenes((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      toast.push('error', (e as Error).message);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = scenes.findIndex((x) => x.id === id);
    const t = idx + dir;
    if (idx === -1 || t < 0 || t >= scenes.length) return;
    const next = [...scenes];
    [next[idx], next[t]] = [next[t], next[idx]];
    setScenes(next.map((x, i) => ({ ...x, sortOrder: i })));
    await Promise.all([
      fetch(`/api/admin/virtual-tour/${next[idx].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: idx }),
      }),
      fetch(`/api/admin/virtual-tour/${next[t].id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sortOrder: t }),
      }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="bg-cream border border-warm-grey/40 rounded-md p-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto_auto] gap-3">
        <input
          value={pendingName}
          onChange={(e) => setPendingName(e.target.value)}
          placeholder="Scene name"
          className="bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={pendingUrl}
          onChange={(e) => setPendingUrl(e.target.value)}
          placeholder="Panorama image URL"
          className="bg-bg-orange border border-warm-grey/30 rounded-md px-3 py-2 text-sm"
        />
        <Button type="button" onClick={() => create(pendingName, pendingUrl)} disabled={busy}>
          <Plus size={14} /> Add
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload size={14} /> Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.length) uploadAndCreate(e.target.files, pendingName);
            e.target.value = '';
          }}
        />
      </div>

      {scenes.length === 0 ? (
        <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center text-umber/60 text-sm">
          No scenes yet. The public tour will fall back to the bundled stock scenes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenes.map((s, i) => (
            <article key={s.id} className="bg-cream border border-warm-grey/40 rounded-md overflow-hidden">
              <div className="relative aspect-[2/1] bg-sand-light">
                <Image src={s.imageUrl} alt={s.name} fill sizes="600px" className="object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <input
                  value={s.name}
                  onChange={(e) => patch(s.id, { name: e.target.value })}
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-sm font-medium"
                />
                <input
                  value={s.thumbnailUrl ?? ''}
                  onChange={(e) => patch(s.id, { thumbnailUrl: e.target.value || null })}
                  placeholder="Thumbnail URL (optional)"
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                />
                <textarea
                  value={s.description ?? ''}
                  onChange={(e) => patch(s.id, { description: e.target.value || null })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full bg-bg-orange border border-warm-grey/30 rounded px-3 py-1.5 text-xs"
                />
                <div className="flex items-center gap-2 justify-between">
                  <StatusBadge status={s.status} />
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="secondary" onClick={() => move(s.id, -1)} disabled={i === 0}>
                      <ArrowUp size={12} />
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => move(s.id, 1)} disabled={i === scenes.length - 1}>
                      <ArrowDown size={12} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        patch(s.id, { status: s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' })
                      }
                    >
                      {s.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => remove(s.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
