// Root layout. Intentionally minimal only renders <html><body> plus
// providers. Public chrome (Navbar/Footer/Chat/WhatsApp) lives in the (site)
// route group; admin chrome lives in /admin/layout.tsx. This separation lets
// the two surfaces be deployed and styled independently (see DEPLOYMENT.md).

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/figtree/index.css';
import '../styles/globals.css';
import { site } from '@/lib/site';
import { Providers } from '@/components/providers/Providers';
import { loadContent } from '@/lib/content/load';

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Ghana's coastal retreat for the soul`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    'KoSa Beach Resort',
    'Ghana beach resort',
    'Elmina coastal retreat',
    'wellness resort Ghana',
    'Ghana wedding venue',
    'KoSa Tea Bar',
    'Akwaaba Stays',
  ],
  authors: [{ name: site.brand }],
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: site.url,
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    images: [{ url: '/og/og-default.jpg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/og/og-default.jpg'],
  },
  alternates: {
    canonical: site.url,
    languages: { en: site.url, fr: `${site.url}/fr` },
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

/** Admin > Settings > SEO & branding wins over the built-in title, description and share image. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await loadContent();
  const title = seo.siteTitle?.trim();
  const description = seo.siteDescription?.trim() || site.description;
  const image = seo.ogImage?.trim() || '/og/og-default.jpg';
  return {
    ...baseMetadata,
    ...(title ? { title: { default: title, template: `%s · ${site.name}` } } : {}),
    description,
    openGraph: { ...baseMetadata.openGraph, ...(title ? { title } : {}), description, images: [{ url: image, width: 1200, height: 630, alt: site.name }] },
    twitter: { ...baseMetadata.twitter, ...(title ? { title } : {}), description, images: [image], ...(seo.twitterHandle ? { site: seo.twitterHandle } : {}) },
  };
}

export const viewport: Viewport = {
  themeColor: '#007C9D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await loadContent();
  const gtm = content.flags.googleTagManagerId || process.env.NEXT_PUBLIC_GTM_ID;
  const ga = content.flags.googleAnalyticsId;
  return (
    <html lang="en">
      <body className="min-h-screen antialiased font-sans">
        <Providers content={content}>{children}</Providers>
        <Analytics />
        {gtm && /^GTM-[A-Z0-9]+$/i.test(gtm) && (
          <Script id="gtm" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        )}
        {ga && /^G-[A-Z0-9]+$/i.test(ga) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="lazyOnload" />
            <Script id="ga" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
