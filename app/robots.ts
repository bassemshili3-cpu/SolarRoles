import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/jobs/employer-',
        disallow: ['/api/', '/auth/', '/admin/'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/jobs/employer-',
        disallow: ['/api/', '/auth/', '/admin/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: ['https://www.solarroles.com/sitemap.xml'],
  }
}
