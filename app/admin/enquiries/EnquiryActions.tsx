'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/admin/Button';
import { useToast } from '@/components/admin/Toast';

export function EnquiryActions({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handled: !handled }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.push('success', !handled ? 'Marked handled' : 'Re-opened');
      startTransition(() => router.refresh());
    } catch (e) {
      toast.push('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" size="sm" variant={handled ? 'secondary' : 'primary'} onClick={toggle} disabled={busy || pending}>
      {busy || pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      {handled ? 'Handled' : 'Mark done'}
    </Button>
  );
}
