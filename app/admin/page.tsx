import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Stats {
  bookings: number;
  enquiries: number;
  subscribers: number;
  sessions: number;
  rooms: number;
  treatments: number;
  experiences: number;
  galleryItems: number;
  journalPosts: number;
  testimonials: number;
}

async function getStats(): Promise<Stats> {
  try {
    const [
      bookings,
      enquiries,
      subscribers,
      sessions,
      rooms,
      treatments,
      experiences,
      galleryItems,
      journalPosts,
      testimonials,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.contactEnquiry.count(),
      prisma.newsletterSubscriber.count(),
      prisma.chatSession.count(),
      prisma.room.count(),
      prisma.treatment.count(),
      prisma.experience.count(),
      prisma.galleryItem.count(),
      prisma.journalPost.count(),
      prisma.testimonial.count(),
    ]);
    return {
      bookings,
      enquiries,
      subscribers,
      sessions,
      rooms,
      treatments,
      experiences,
      galleryItems,
      journalPosts,
      testimonials,
    };
  } catch {
    return {
      bookings: 0,
      enquiries: 0,
      subscribers: 0,
      sessions: 0,
      rooms: 0,
      treatments: 0,
      experiences: 0,
      galleryItems: 0,
      journalPosts: 0,
      testimonials: 0,
    };
  }
}

interface TileProps {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}

function Tile({ label, value, href, accent }: TileProps) {
  return (
    <Link
      href={href}
      className={`block rounded-md p-5 shadow-sm hover:shadow-xl transition-shadow ${accent ? 'bg-umber text-cream' : 'bg-cream text-umber'}`}
    >
      <p className="text-[10px] font-poppins uppercase tracking-tracked text-primary">{label}</p>
      <p className="mt-2 font-belleza text-4xl">{value}</p>
    </Link>
  );
}

export default async function AdminHome() {
  const stats = await getStats();

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Overview"
        title="A quiet console."
        description="Manage stays, conversations, and content. The shore is quiet the dashboard should be too."
      />

      <div className="space-y-10">
        <div>
          <h2 className="font-belleza text-xl text-umber mb-4">Operations</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label="Bookings" value={stats.bookings} href="/admin/bookings" accent />
            <Tile label="Enquiries" value={stats.enquiries} href="/admin/enquiries" />
            <Tile label="Subscribers" value={stats.subscribers} href="/admin/newsletter" />
            <Tile label="Chat sessions" value={stats.sessions} href="/admin/chat" />
          </div>
        </div>

        <div>
          <h2 className="font-belleza text-xl text-umber mb-4">Content</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label="Rooms" value={stats.rooms} href="/admin/rooms" />
            <Tile label="Treatments" value={stats.treatments} href="/admin/wellness" />
            <Tile label="Experiences" value={stats.experiences} href="/admin/experiences" />
            <Tile label="Gallery" value={stats.galleryItems} href="/admin/gallery" />
            <Tile label="Journal" value={stats.journalPosts} href="/admin/journal" />
            <Tile label="Testimonials" value={stats.testimonials} href="/admin/testimonials" />
          </div>
        </div>

        <div className="bg-cream rounded-md p-8 shadow-sm">
          <h2 className="font-belleza text-2xl text-umber">Integrations</h2>
          <ul className="mt-5 space-y-2 text-sm text-umber/75">
            <li>
              Cloudbeds PMS:{' '}
              {process.env.CLOUDBEDS_PROPERTY_ID ? '✓ Configured' : 'not configured'}
            </li>
            <li>
              OpenRouter AI:{' '}
              {process.env.OPENROUTER_API_KEY ? '✓ Connected' : 'using static fallback'}
            </li>
            <li>
              Supabase Storage:{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Connected' : 'not configured'}
            </li>
            <li>
              Resend mail: {process.env.RESEND_API_KEY ? '✓ Connected' : 'not configured'}
            </li>
            <li>
              Google Drive (virtual tour):{' '}
              {process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT ? '✓ Connected' : 'using fallback scenes'}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
