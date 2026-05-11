export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-12 rounded-full" />
          <div className="skeleton h-5 w-10 rounded-full" />
        </div>
        <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
    </div>
  )
}
