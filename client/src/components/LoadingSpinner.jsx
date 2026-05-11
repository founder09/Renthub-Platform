export default function LoadingSpinner({ fullPage = true }) {
  const wrapper = fullPage
    ? 'min-h-screen flex items-center justify-center bg-slate-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={wrapper}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-rose-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading…</p>
      </div>
    </div>
  )
}
