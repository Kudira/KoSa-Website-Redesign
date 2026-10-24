import { site } from '@/lib/site';

export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LodgingBusiness', 'LocalBusiness', 'Resort'],
        '@id': `${site.url}#org`,
        name: site.name,
        alternateName: site.brand,
        url: site.url,
        logo: `${site.url}/icons/logo.png`,
        image: `${site.url}/og/og-default.jpg`,
        priceRange: '$$$',
        telephone: site.contact.phone,
        email: site.contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.contact.address,
          addressLocality: site.location.city,
          addressRegion: 'Central Region',
          addressCountry: 'GH',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.location.lat,
          longitude: site.location.lng,
        },
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Beachfront', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Spa & Wellness', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Restaurant', value: true },
        ],
        sameAs: [site.socials.instagram, site.socials.facebook, site.socials.tripadvisor],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}#site`,
        url: site.url,
        name: site.name,
        publisher: { '@id': `${site.url}#org` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${site.url}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
