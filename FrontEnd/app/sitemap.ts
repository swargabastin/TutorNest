import { MetadataRoute } from 'next';

const BASE_URL = 'https://tutor-nest-delta.vercel.app';

const CITIES = [
  'kochi',
  'thiruvananthapuram',
  'kozhikode',
  'thrissur',
  'kollam',
  'kottayam',
  'kannur',
  'palakkad',
  'alappuzha',
  'malappuram',
];

const SUBJECTS = [
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'english',
  'computer-science',
  'accountancy',
  'economics',
  'hindi',
  'malayalam',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static high-value routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/post-requirement`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/register/tutor`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/register/student`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Programmatic SEO landing pages (City x Subject)
  const programmaticRoutes: MetadataRoute.Sitemap = [];
  for (const city of CITIES) {
    for (const subject of SUBJECTS) {
      programmaticRoutes.push({
        url: `${BASE_URL}/tutors/${city}/${subject}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  return [...staticRoutes, ...programmaticRoutes];
}
