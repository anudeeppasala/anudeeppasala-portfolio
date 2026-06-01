import profile from '@/data/profile.json'
import { SITE_URL } from '@/lib/siteConfig'

const title = `${profile.name.full} | ${profile.roles.short}`
const description = profile.description

export function buildSiteMetadata() {
  const keywords = [
    profile.name.full,
    profile.roles.short,
    ...profile.roles.detailed.split('·').map((s) => s.trim()),
    'Python Full-Stack Developer',
    'Full-Stack Developer',
    'Portfolio',
    profile.location.based,
  ].filter(Boolean)

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${profile.name.full}`,
    },
    description,
    keywords,
    authors: [{ name: profile.name.full, url: SITE_URL }],
    creator: profile.name.full,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: profile.name.full,
      title,
      description,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${profile.name.full} | ${profile.roles.short} Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: [
        { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicons/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/favicons/apple-touch-icon.png' },
        { url: '/favicons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'icon', url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { rel: 'icon', url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    manifest: '/favicons/manifest.webmanifest',
  }
}

export function buildPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name.full,
    url: SITE_URL,
    email: profile.email,
    telephone: profile.phone?.tel,
    jobTitle: profile.roles.short,
    sameAs: profile.socials.map((s) => s.href),
  }
}
