'use client';

import { Download } from 'lucide-react';
import { LinkButton } from '@/components/admin/Button';

export function ExportButton() {
  return (
    <LinkButton href="/api/admin/newsletter/export" variant="secondary" target="_blank">
      <Download size={14} /> Export CSV
    </LinkButton>
  );
}
