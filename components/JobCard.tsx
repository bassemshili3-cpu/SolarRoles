'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  salary_min?: number
  salary_max?: number
  redirect_url: string
  created: string
  description?: string
  contract_type?: string
  contract_time?: string
}

export default function JobCard({ job }: { job: Job }) {
  const router = useRouter()

  const salary = job.salary_min && job.salary_max
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
    : 'Salary not listed'

  const handleClick = () => {
    const data = encodeURIComponent(JSON.stringify(job))
    router.push(`/jobs/${job.id}?data=${data}`)
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="p-6 hover:shadow-xl transition-all group">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="text-muted-foreground">{job.company.display_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location.display_name}</div>
          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.created).toLocaleDateString()}</div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-emerald-600 flex items-center gap-1">
            <DollarSign className="w-6 h-6" /> {salary}
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={handleClick}>
              Apply now
            </Button>
            <Button variant="outline" size="sm" onClick={() => {/* save to Supabase */}}>
              ❤️ Save
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}