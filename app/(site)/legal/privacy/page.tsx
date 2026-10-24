import type { Metadata } from 'next';
import { Section, Eyebrow, Heading, GoldDivider } from '@/components/shared/Section';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How KoSa Beach Resort collects, uses, and protects your personal information',
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  const updated = 'May 2026';
  return (
    <div data-sky="dawn" className="pt-32 md:pt-44">
      <Section space="sm">
        <div className="max-w-3xl">
          <Eyebrow>Legal, last updated {updated}</Eyebrow>
          <Heading className="mt-5">Privacy Policy</Heading>
          <GoldDivider />

          <article className="prose prose-umber max-w-none font-sans text-forest/85 space-y-6 leading-relaxed">
            <p>
              KoSa Beach Resort (&ldquo;KoSa&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects
              your privacy. This policy explains what personal information we collect when you visit{' '}
              <strong>ko-sa.com</strong>, make a reservation, contact us, or subscribe to our
              newsletter, how we use it, and the rights you have over it.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">1. Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Booking details</strong> name, email, phone, address, dates of stay,
                guest counts, and payment information collected via our PMS partner Cloudbeds.
              </li>
              <li>
                <strong>Contact and newsletter</strong> name and email submitted through forms.
              </li>
              <li>
                <strong>Concierge chat</strong> messages exchanged with our AI concierge
                (&ldquo;Abena&rdquo;), retained on our servers for 90 days and used to improve
                responses. We do not train external models on your conversations.
              </li>
              <li>
                <strong>Technical data</strong> IP address, device, browser, pages visited,
                collected through cookies and analytics for site reliability and aggregated
                reporting.
              </li>
            </ul>

            <h2 className="font-display text-2xl text-forest mt-10">2. How we use it</h2>
            <p>
              We process your information to manage your reservation, deliver requested services,
              respond to enquiries, send transactional and (where you have opted in) marketing
              email, comply with legal obligations, and improve our website.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">3. Sharing</h2>
            <p>
              We share data only with processors who help us run the property Cloudbeds (PMS),
              Resend (email), Supabase (hosting), Vercel (hosting), and analytics tools under
              contracts that bind them to confidentiality and equivalent data-protection
              standards. We never sell personal data.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">4. Your rights</h2>
            <p>
              You may at any time request access, correction, deletion, or portability of your
              personal data, withdraw consent for marketing, or lodge a complaint with the Ghana
              Data Protection Commission. Email{' '}
              <a className="text-primary underline" href="mailto:hello@ko-sa.com">
                hello@ko-sa.com
              </a>{' '}
              and we will respond within 30 days.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">5. Cookies</h2>
            <p>
              We use a small number of cookies for session continuity, language preference, and
              aggregated analytics. You can disable cookies in your browser; some site features
              may degrade.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">6. Retention</h2>
            <p>
              Booking records are kept for 7 years (Ghana Revenue Authority requirement); contact
              enquiries for 24 months; chat sessions for 90 days; newsletter subscriptions until
              you unsubscribe.
            </p>

            <h2 className="font-display text-2xl text-forest mt-10">7. Contact</h2>
            <p>
              KoSa Beach Resort · Beach Road No.1, Ampenyi, Elmina, Ghana ·{' '}
              <a className="text-primary underline" href="mailto:info@ko-sa.com">
                info@ko-sa.com
              </a>
            </p>
          </article>
        </div>
      </Section>
    </div>
  );
}
