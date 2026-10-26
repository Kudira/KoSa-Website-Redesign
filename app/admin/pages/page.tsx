import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { readContentRows } from '@/lib/content/load';
import { PAGE_REGISTRY, editedCounts, editorFields } from '@/lib/content/fields';
import { PagesIndex } from './PagesIndex';

export const metadata: Metadata = { title: 'Pages · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function PagesAdmin() {
  const content = await readContentRows().catch(() => null);
  const counts = content ? editedCounts(content) : {};
  const pages = PAGE_REGISTRY.map((p) => ({ id: p.id, label: p.label, path: p.path, fields: p.fields.length, edited: counts[p.id] ?? 0 }));
  // Everything searchable, so "where is that sentence?" has a quick answer.
  const index = content
    ? PAGE_REGISTRY.flatMap((p) =>
        editorFields(p.id, 'en', content).map((f) => ({
          page: p.id,
          pageLabel: p.label,
          section: f.section,
          label: f.label,
          text: (f.current || f.builtIn).slice(0, 220),
          kind: f.kind,
        })),
      )
    : [];

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Pages"
        description="Change the words, photos, films and prices on any page of the website. Rooms, treatments, menus and other lists are edited in their own sections."
      />
      {!content && <p className="mb-6 text-sm text-red-700">The database could not be reached, so edits cannot be shown right now.</p>}
      <PagesIndex pages={pages} index={index} />
    </section>
  );
}
