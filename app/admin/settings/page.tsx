import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { SettingsForm } from './SettingsForm';
import { settingsKeySchemas, type SettingsKey } from '@/lib/admin/schemas/settings';

export const metadata: Metadata = { title: 'Site settings · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const rows = await prisma.siteSetting.findMany();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
  const initial: Record<SettingsKey, Record<string, unknown>> = {} as Record<SettingsKey, Record<string, unknown>>;
  for (const key of Object.keys(settingsKeySchemas) as SettingsKey[]) {
    initial[key] = (byKey[key] as Record<string, unknown> | undefined) ?? {};
  }

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="Site-wide values that aren't tied to a specific page."
      />
      <SettingsForm initial={initial} />
    </section>
  );
}
