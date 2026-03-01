import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ data?: string }>
}) {
  const { id } = await params
  const { data } = await searchParams

  if (!data) notFound()

  const job = JSON.parse(decodeURIComponent(data))

  const salary = job.salary_min && job.salary_max
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
    : 'Salary not listed'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/jobs" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-lg">{job.company?.display_name}</span>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
              Apply on Adzuna <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {job.location?.display_name}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {new Date(job.created).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-base">
            <DollarSign className="w-4 h-4" /> {salary}
          </div>
          {job.contract_type && (
            <span className="bg-secondary px-3 py-1 rounded-full capitalize">{job.contract_type}</span>
          )}
          {job.contract_time && (
            <span className="bg-secondary px-3 py-1 rounded-full capitalize">{job.contract_time.replace('_', ' ')}</span>
          )}
        </div>

        <hr className="my-8" />

        <div>
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        <div className="mt-8">
          <Button asChild size="lg" className="w-full md:w-auto">
            <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
              Apply now <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}