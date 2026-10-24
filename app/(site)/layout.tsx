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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      <ChatWidget />
      <FloatingWhatsApp />
      <ExitIntentPopup />
    </>
  );
}
