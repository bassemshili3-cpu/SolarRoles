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
      url: 'https://www.oh-my-job.com/allied-universal-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/cna-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/dental-assistant-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/dignity-health-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/oil-rig-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/pharmacy-technician-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/project-manager-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/amgen-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/armed-security-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/city-of-reno-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/healthcare-administration-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/press-association-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/substitute-teacher-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.oh-my-job.com/ucsd-jobs',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
  ]
}