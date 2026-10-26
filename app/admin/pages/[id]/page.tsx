import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/PageHeader';
import { readContentRows } from '@/lib/content/load';
import { PAGE_REGISTRY, editorFields } from '@/lib/content/fields';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/dictionaries';
import { PageEditor } from './PageEditor';

export const metadata: Metadata = { title: 'Edit page · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const LANGS: Record<Locale, string> = { en: 'English', fr: 'Français', es: 'Español', nl: 'Nederlands', de: 'Deutsch', zh: '中文' };

export default async function EditPage({ params, searchParams }: { params: { id: string }; searchParams: { lang?: string } }) {
  const page = PAGE_REGISTRY.find((p) => p.id === params.id);
  if (!page) notFound();
  const locale = ((SUPPORTED_LOCALES as readonly string[]).includes(searchParams.lang ?? '') ? searchParams.lang : 'en') as Locale;
  const content = await readContentRows();
  const fields = editorFields(page.id, locale, content);

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Pages"
        title={page.label}
        backHref="/admin/pages"
        description="Change anything below and press Save. Leave a box as it is to keep the current wording. Reset puts the original back."
      />
      <PageEditor
        key={`${page.id}-${locale}`}
        pageId={page.id}
        pagePath={page.path}
        locale={locale}
        languages={SUPPORTED_LOCALES.map((l) => ({ code: l, label: LANGS[l] }))}
        fields={fields}
      />
    </section>
  );
}
