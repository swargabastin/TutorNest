import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/tutors/',
        '/tutor/',
        '/search',
        '/pricing',
        '/post-requirement',
        '/privacy',
        '/terms',
        '/refund-policy',
      ],
      disallow: [
        '/dashboard/',
        '/payment/',
        '/wallet',
        '/messages/',
        '/api/',
      ],
    },
    sitemap: 'https://tutor-nest-delta.vercel.app/sitemap.xml',
  };
}
