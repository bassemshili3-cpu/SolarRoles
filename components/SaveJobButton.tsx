'use client'
import { SavedJobCards, SaveJobCardButton } from './SavedJobCards'
export default function SaveJobButton({ jobId }: { jobId: string }) {
 return <SavedJobCards><SaveJobCardButton jobId={jobId} showLabel /></SavedJobCards>
}
