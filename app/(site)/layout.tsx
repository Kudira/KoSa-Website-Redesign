// Public-site layout. Wraps every page in the (site) route group with the
// shared chrome (preloader, smooth scroll, navbar, footer, chat, WhatsApp,
// JSON-LD). Admin uses its own layout at /admin/layout.tsx so the two
// surfaces never bleed into each other.

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Preloader } from '@/components/layout/Preloader';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp';
import { JsonLd } from '@/components/seo/JsonLd';
import { ExitIntentPopup } from '@/components/marketing/ExitIntentPopup';
import { Sky } from '@/components/ui/Sky';
import { loadContent } from '@/lib/content/load';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Switches from Admin > Settings (maintenance banner, chat, newsletter).
  const { flags } = await loadContent();
  const notice = flags.maintenance?.enabled ? flags.maintenance.message?.trim() : '';
  return (
    <>
      {notice ? (
        <div role="status" className="relative z-[60] bg-forest-900 px-4 py-2.5 text-center text-sm text-cream">
          {notice}
        </div>
      ) : null}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <JsonLd />
      <Preloader />
      <SmoothScroll />
      <Sky />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      {flags.chatEnabled !== false && <ChatWidget />}
      <FloatingWhatsApp />
      {flags.newsletterEnabled !== false && <ExitIntentPopup />}
    </>
  );
}
