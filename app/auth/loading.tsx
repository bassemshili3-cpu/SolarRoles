// Keep the former global loading boundary on auth pages only. Job decisions
// must run without an ancestor loading boundary to retain HTTP 308/404.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}
