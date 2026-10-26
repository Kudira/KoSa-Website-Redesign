import type { Metadata } from 'next';
import { Section, Eyebrow, Heading, GoldDivider } from '@/components/shared/Section';
import { PlainRichText } from '@/components/content/PlainRichText';
import { pageText } from '@/lib/content/page-text';
import { loadContent } from '@/lib/content/load';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of the KoSa Beach Resort website and services',
  alternates: { canonical: '/legal/terms' },
};

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  await loadContent();
  const c = pageText.terms;
  return (
    <div data-sky="dawn" className="pt-32 md:pt-44">
      <Section space="sm">
        <div className="max-w-3xl">
          <Eyebrow>Legal, last updated {c.updated}</Eyebrow>
          <Heading className="mt-5">{c.title}</Heading>
          <GoldDivider />
          <article className="prose prose-umber max-w-none font-sans text-forest/85 space-y-6 leading-relaxed">
            <PlainRichText text={c.body} headingClassName="font-display text-2xl text-forest mt-10" />
          </article>
        </div>
      </Section>
    </div>
  );
}
