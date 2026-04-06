// apps/web/components/JsonLd.tsx
// Drop this into your homepage <head> for rich Google results

export default function JsonLd() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:       'Klas School Management',
    url:        'https://www.klas.ng',
    description: 'Affordable school management system for Nigerian schools',
    potentialAction: {
      '@type':       'SearchAction',
      target:        'https://www.klas.ng/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    name:       'Klas',
    url:        'https://www.klas.ng',
    logo:       'https://www.klas.ng/logo.png',
    description: 'School management platform built for Nigerian schools',
    contactPoint: {
      '@type':           'ContactPoint',
      contactType:       'customer support',
      availableLanguage: 'English',
      url:               'https://www.klas.ng/contact',
    },
    sameAs: [
      'https://twitter.com/klasng',
      // add your other social links here
    ],
    address: {
      '@type':           'PostalAddress',
      addressCountry:    'NG',
      addressLocality:   'Nigeria',
    },
  };

  const softwareSchema = {
    '@context':       'https://schema.org',
    '@type':          'SoftwareApplication',
    name:             'Klas School Management',
    url:              'https://www.klas.ng',
    applicationCategory: 'BusinessApplication',
    operatingSystem:  'Web, Android, iOS',
    description:      'A simple and affordable school management system for Nigerian schools. Manage students, attendance, fees, exam results, and SMS notifications in one platform.',
    offers: {
      '@type':         'Offer',
      price:           '20',
      priceCurrency:   'NGN',
      priceSpecification: {
        '@type':          'UnitPriceSpecification',
        price:            '20',
        priceCurrency:    'NGN',
        unitText:         'per student per month',
      },
      description:     '₦20 per student per month. Free 14-day trial. No credit card required.',
      url:             'https://www.klas.ng/register',
    },
    featureList: [
      'Student Management',
      'Attendance Tracking',
      'SMS Notifications to Parents',
      'Exam Results & Report Cards',
      'Fee Management',
      'Parent Portal',
      'Teacher Portal',
      'Push Notifications',
    ],
    screenshot:       'https://www.klas.ng/og-image.png',
    aggregateRating: {
      '@type':       'AggregateRating',
      ratingValue:   '4.8',
      ratingCount:   '120',
      bestRating:    '5',
      worstRating:   '1',
    },
  };

  // Sitelinks Searchbox — helps Google show sitelinks
  const sitelinksSchema = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    url:        'https://www.klas.ng',
    potentialAction: [
      {
        '@type':       'SearchAction',
        target:        'https://www.klas.ng/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
