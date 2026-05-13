import {
  GraduationCap, Home, Layers, Building2, School, Palette,
  Users, UserCheck, UserX, SlidersHorizontal, RotateCcw, ChevronDown
} from 'lucide-react'

const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]

const LISTING_TYPES = [
  { value: 'Room', label: 'Room', icon: <Home size={13} /> },
  { value: 'PG', label: 'PG', icon: <Layers size={13} /> },
  { value: 'Flat', label: 'Flat', icon: <Building2 size={13} /> },
  { value: 'Hostel', label: 'Hostel', icon: <School size={13} /> },
  { value: 'Studio', label: 'Studio', icon: <Palette size={13} /> },
]

const GENDER_OPTIONS = [
  { value: 'Any', label: 'Any Gender', icon: <Users size={13} /> },
  { value: 'Male', label: 'Male Only', icon: <UserCheck size={13} /> },
  { value: 'Female', label: 'Female Only', icon: <UserX size={13} /> },
]

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
]

const hasActiveFilters = (f) =>
  f.nearCollege || f.listingType || f.gender !== 'Any' || f.minPrice || f.maxPrice

export default function FilterBar({ filters, onChange }) {
  const { nearCollege, listingType, gender, minPrice, maxPrice, sortBy } = filters

  const set = (key, val) => onChange({ ...filters, [key]: val })
  const clear = () => onChange({ nearCollege: '', listingType: '', gender: 'Any', minPrice: '', maxPrice: '', sortBy: '' })

  return (
    <div className="space-y-4">

      {/* ── Header row ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
          Filters
        </div>
        {hasActiveFilters(filters) && (
          <button onClick={clear}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--brand-600)' }}>
            <RotateCcw size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* ── College chips ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <GraduationCap size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Near College
          </span>
        </div>
        <div className="scroll-x flex gap-2 pb-1">
          <button className={`chip ${!nearCollege ? 'active' : ''}`}
            onClick={() => set('nearCollege', '')}>
            All Colleges
          </button>
          {COLLEGES.map(c => (
            <button key={c}
              className={`chip ${nearCollege === c ? 'active' : ''}`}
              onClick={() => set('nearCollege', nearCollege === c ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Type + Gender + Sort ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Type chips */}
        <div className="scroll-x flex gap-1.5">
          <button className={`chip ${!listingType ? 'active' : ''}`}
            onClick={() => set('listingType', '')}>
            All Types
          </button>
          {LISTING_TYPES.map(t => (
            <button key={t.value}
              className={`chip ${listingType === t.value ? 'active' : ''}`}
              onClick={() => set('listingType', listingType === t.value ? '' : t.value)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5" style={{ background: 'var(--border-default)' }} />

        {/* Gender */}
        <div className="flex gap-1.5">
          {GENDER_OPTIONS.map(g => (
            <button key={g.value}
              className={`chip ${gender === g.value ? 'active' : ''}`}
              onClick={() => set('gender', g.value)}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy || ''}
            onChange={e => set('sortBy', e.target.value)}
            className="input btn-sm pr-8 appearance-none cursor-pointer"
            style={{ height: 36, paddingLeft: 12 }}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* ── Price range ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Budget (₹/mo)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="Min" min="0"
            value={minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
            className="input text-xs w-24"
            style={{ height: 34 }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="number" placeholder="Max" min="0"
            value={maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
            className="input text-xs w-24"
            style={{ height: 34 }} />
        </div>
      </div>
    </div>
  )
}
