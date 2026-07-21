import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/jobs/own-',
        disallow: ['/api/', '/jobs/', '/auth/'],
      },
    ],
    sitemap: [
      'https://www.oh-my-job.com/sitemap.xml',
    ],
  }
}