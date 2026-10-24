'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

type Status = 'NEW' | 'CONTACTED' | 'CLOSED';
const NEXT: Record<Status, Status> = { NEW: 'CONTACTED', CONTACTED: 'CLOSED', CLOSED: 'NEW' };
const STYLE: Record<Status, string> = {
  NEW: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  CONTACTED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  CLOSED: 'bg-green-100 text-green-800 hover:bg-green-200',
};

export function ServiceEnquiryActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function advance() {
    setBusy(true);
    try {
      const next = NEXT[status];
      const res = await fetch(`/api/admin/service-enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.push('success', `Marked ${next.toLowerCase()}`);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this enquiry?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/service-enquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.push('success', 'Deleted');
      startTransition(() => router.refresh());
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={advance}
        disabled={busy || pending}
        title="Click to advance status"
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-opensans uppercase tracking-wider transition-colors disabled:opacity-60 ${STYLE[status]}`}
      >
        {(busy || pending) && <Loader2 size={11} className="animate-spin" />}
        {status}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy || pending}
        aria-label="Delete"
        className="text-umber/40 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
