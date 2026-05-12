import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { getAllListings } from '../api/listingsApi'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import FilterBar from '../components/FilterBar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

/* ── Stats data ──────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Students Housed', value: '5,200+', icon: <Users size={20} /> },
  { label: 'Verified Landlords', value: '340+', icon: <ShieldCheck size={20} /> },
  { label: 'Partner Colleges', value: '10', icon: <GraduationCap size={20} /> },
  { label: 'Cities Covered', value: '18+', icon: <MapPin size={20} /> },
]

export default function ListingIndex() {
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [savedIds, setSavedIds] = useState([])

  const [page, setPage] = useState(1)
  const LIMIT = 12

  const [filters, setFilters] = useState({
    nearCollege: '',
    listingType: '',
    gender: 'Any',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    amenities: '',
  })

  // Reset to page 1 on filter/search change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])


  /* ── Fetch saved listings ─────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return

    api.get('/profile')
      .then((r) => {
        setSavedIds(
          (r.data.data.savedListings || []).map((l) => l._id || l)
        )
      })
      .catch(() => { })
  }, [user])

  /* ── Fetch listings (server-side search + pagination) ────────────── */
  const fetchListings = async () => {
    const params = { page, limit: LIMIT }

    if (search)                                params.search      = search
    if (filters.nearCollege)                   params.nearCollege = filters.nearCollege
    if (filters.listingType)                   params.listingType = filters.listingType
    if (filters.gender && filters.gender !== 'Any') params.gender = filters.gender
    if (filters.minPrice)                      params.minPrice    = filters.minPrice
    if (filters.maxPrice)                      params.maxPrice    = filters.maxPrice
    if (filters.sortBy)                        params.sort        = filters.sortBy
    if (filters.amenities)                     params.amenities   = filters.amenities

    const { data } = await getAllListings(params)
    // New backend returns { listings, total, page, totalPages }
    return data.data
  }

  /* ── React Query ──────────────────────────────────────────────────── */
  const {
    data: pageData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['listings', search, filters, page],
    queryFn: fetchListings,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  })

  const listings   = pageData?.listings   || []
  const totalCount = pageData?.total      || 0
  const totalPages = pageData?.totalPages || 1

  const error = queryError
    ? 'Failed to load listings. Please try again.'
    : ''

  /* ── Save / Unsave Listing ────────────────────────────────────────── */
  const handleToggleSave = async (listingId) => {
    if (!user) return

    try {
      const { data } = await api.post(`/profile/save/${listingId}`)

      setSavedIds(
        data.savedListings.map((id) => id.toString())
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden">

        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #818cf8 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Glow Effects */}
        <div
          className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: '#6366f1' }}
        />

        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: '#06b6d4' }}
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">

          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white mb-6 border"
              style={{
                background: 'rgba(99,102,241,0.2)',
                borderColor: 'rgba(129,140,248,0.3)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Now live across 10 colleges in India
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              Find Student Housing
              <br />

              <span
                style={{
                  background:
                    'linear-gradient(135deg, #818cf8, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Near Your College
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
              Verified rooms, PGs and flats trusted by 5,000+ students.
              Browse listings near your campus in seconds.
            </p>

            {/* Search Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1) }}
              className="flex gap-3 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative">

                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#64748b' }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value) }}
                  placeholder="Search by title, location, college…"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    color: '#f1f5f9',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-lg px-7"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Listings Section ─────────────────────────────────────────── */}
      <div className="container-main">

        {/* Filter Bar */}
        <div className="surface p-5 mb-6">
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">

          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {loading
                ? 'Loading listings…'
                : `${totalCount} listing${totalCount !== 1 ? 's' : ''} found`}
            </h2>
            {totalPages > 1 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>Page {page} of {totalPages}</p>
            )}
          </div>

          {(user?.role === 'owner' || user?.role === 'admin') && (
            <Link
              to="/listings/new"
              className="btn-primary btn-sm gap-1.5"
            >
              <Plus size={14} />
              Add Listing
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(LIMIT)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : error ? (

          /* Error */
          <div className="surface py-20 text-center">

            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {error}
            </p>

            <button
              onClick={refetch}
              className="btn-primary btn-sm mt-4"
            >
              Retry
            </button>
          </div>

        ) : listings.length === 0 ? (

          /* Empty State */
          <div className="surface py-24 text-center">

            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              No listings found
            </h3>

            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Try adjusting your filters.
            </p>
          </div>

        ) : (

          /* Listings Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            {listings.map((listing, i) => (
              <div
                key={listing._id}
                className="fade-in-up"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <ListingCard
                  listing={listing}
                  savedIds={savedIds}
                  onToggleSave={
                    user ? handleToggleSave : null
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40, marginBottom: 20 }}>
            <button
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--border-default)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.15s' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <button key={pageNum} onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid', borderColor: page === pageNum ? '#6366f1' : 'var(--border-default)', background: page === pageNum ? '#6366f1' : 'transparent', color: page === pageNum ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--border-default)', background: 'transparent', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.15s' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}