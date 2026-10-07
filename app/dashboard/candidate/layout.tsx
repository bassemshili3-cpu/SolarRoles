import { requireAccount } from '@/lib/requireAccount'
export default async function Layout({ children }: { children: React.ReactNode }) {
 await requireAccount('candidate', '/dashboard/candidate')
 return children
}
