import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.oh-my-job.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.oh-my-job.com/jobs',
      lastModified: new Date(),
      changeFrequency: 'hourly', // les offres changent souvent
      priority: 0.9,
    },
    {
      url: 'https://www.oh-my-job.com/jobs-for-14-year-olds',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.oh-my-job.com/jobs-for-15-year-olds',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.oh-my-job.com/jobs-for-16-year-olds',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.oh-my-job.com/fifo-jobs',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.oh-my-job.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}