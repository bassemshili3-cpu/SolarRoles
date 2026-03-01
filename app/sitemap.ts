import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.oh-my-job.com', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/jobs', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/privacy', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/jobs-for-14-year-olds', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/jobs-for-15-year-olds', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/jobs-for-16-year-olds', lastModified: new Date() },
    { url: 'https://www.oh-my-job.com/fifo-jobs', lastModified: new Date() },
  ]
}