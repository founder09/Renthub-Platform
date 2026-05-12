import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, deleteListing } from '../api/listingsApi'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/ReviewCard'
import ReviewForm from '../components/ReviewForm'
import MapView    from '../components/MapView'
import LoadingSpinner from '../components/LoadingSpinner'
import BookingModal from '../components/BookingModal'
import { TYPE_META, AMENITY_ICONS } from '../components/ListingCard'
import toast from 'react-hot-toast'
import {
  MapPin, Star, ShieldCheck, Edit3, Trash2,
  Users, BedDouble, Bath, Maximize,
  ChevronRight, MessageSquare, Home, ClipboardList
} from 'lucide-react'

const FALLBACK = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'

function AmenityPill({ label }) {
  const icon = AMENITY_ICONS[label] || <Home size={20} />
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 0', borderBottom: '1px solid var(--border-default)',
      fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
      {label}
    </div>
  )
}

export default function ListingShow() {
  const { id }      = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [listing, setListing]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showBooking, setShowBooking] = useState(false)

  const [currentImg, setCurrentImg] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getListing(id)
        setListing(data.data)
      } catch {
        toast.error('Listing not found')
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeleting(true)
    try {
      await deleteListing(id)
      toast.success('Listing deleted')
      navigate('/listings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  const handleReviewAdded   = (r)  => setListing(p => ({ ...p, reviews: [r, ...p.reviews] }))
  const handleReviewDeleted = (rid) => setListing(p => ({ ...p, reviews: p.reviews.filter(r => r._id !== rid) }))

  if (loading) return <LoadingSpinner />
  if (!listing) return null

  const isOwner   = user && listing.owner?._id === user.id
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null
  const typeMeta  = TYPE_META[listing.listingType] || TYPE_META.Room

  const allImages = [
    listing.image?.url,
    ...(listing.roomImages?.map(img => img.url) || [])
  ].filter(Boolean)
  const images = allImages.length > 0 ? allImages : [FALLBACK]
  
  const nextImg = () => setCurrentImg(p => (p + 1) % images.length)
  const prevImg = () => setCurrentImg(p => (p - 1 + images.length) % images.length)

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* ── Header Title & Details ──────────────────────────────────────────── */}
      <div style={{ paddingTop: 32, paddingBottom: 24 }}>
        <h1 style={{
          margin: '0 0 8px', color: 'var(--text-primary)',
          fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.2,
        }}>
          {listing.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)' }}>
          {avgRating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-primary)' }}>
              <Star size={14} fill="var(--text-primary)" stroke="none" />
              {avgRating} <span style={{ textDecoration: 'underline', fontWeight: 500 }}>{listing.reviews.length} reviews</span>
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'underline', fontWeight: 500 }}>
            {listing.location}, {listing.country}
          </span>
          {listing.nearCollege && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--brand-600)', fontWeight: 600 }}>
              Near {listing.nearCollege}
            </span>
          )}
        </div>
      </div>

      {/* ── Hero Image Slider ──────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        height: '60vh', minHeight: 400, position: 'relative',
        marginBottom: 48, background: '#000',
      }}>
        <img
          src={images[currentImg]}
          alt={`${listing.title} - Photo ${currentImg + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = FALLBACK }}
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImg}
              style={{
                position: 'absolute', top: '50%', left: 24, transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.8)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={nextImg}
              style={{
                position: 'absolute', top: '50%', right: 24, transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.8)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <div style={{
              position: 'absolute', bottom: 24, right: 24, background: 'rgba(0,0,0,0.6)', 
              color: 'white', padding: '4px 12px', borderRadius: 16, fontSize: 14, fontWeight: 500
            }}>
              {currentImg + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'start', className: 'listing-show-grid' }}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Type & Host info */}
          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid var(--border-default)' }}>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
                {listing.listingType} hosted by {listing.owner?.username}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={16} /> {listing.maxGuests || 1} guests</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BedDouble size={16} /> {listing.bedrooms || 1} bedrooms</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Bath size={16} /> {listing.bathrooms || 1} baths</span>
                {listing.floorSize > 0 && (
                  <>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Maximize size={16} /> {listing.floorSize} sq ft</span>
                  </>
                )}
              </div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0,
            }}>
              {listing.owner?.username?.[0]?.toUpperCase()}
            </div>
          </section>

          {/* Description */}
          <section style={{ paddingBottom: 40, borderBottom: '1px solid var(--border-default)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              About this place
            </h2>
            {listing.gender && listing.gender !== 'Any' && (
              <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--brand-600)', fontWeight: 600, display: 'inline-block', padding: '6px 12px', background: 'var(--brand-50)', borderRadius: 8 }}>
                {listing.gender === 'Male' ? '♂ Male students only' : '♀ Female students only'}
              </p>
            )}
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {listing.description || 'No description provided.'}
            </p>
          </section>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <section style={{ paddingBottom: 40, borderBottom: '1px solid var(--border-default)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
                What this place offers
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 32 }}>
                {listing.amenities.map(a => <AmenityPill key={a} label={a} />)}
              </div>
            </section>
          )}

          {/* House Rules */}
          {listing.houseRules?.length > 0 && (
            <section style={{ paddingBottom: 40, borderBottom: '1px solid var(--border-default)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
                House Rules
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {listing.houseRules.map((rule, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15, color: 'var(--text-secondary)' }}>
                    <ClipboardList size={20} style={{ color: 'var(--text-muted)' }} />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Map Location */}
          <section style={{ paddingBottom: 40, borderBottom: '1px solid var(--border-default)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              Where you'll be
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--text-secondary)' }}>
              {listing.location}, {listing.country}
            </p>
            <div style={{ height: 400, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
              <MapView
                geometry={listing.geometry}
                title={listing.title}
                location={`${listing.location}, ${listing.country}`}
              />
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Exact address provided after booking confirmation.
            </p>
          </section>

          {/* Reviews */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <Star size={24} fill="var(--text-primary)" stroke="none" />
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>
                {avgRating ? `${avgRating} · ${listing.reviews.length} reviews` : 'No reviews (yet)'}
              </h2>
            </div>

            {user && (
              <div style={{ marginBottom: 40 }}>
                <ReviewForm listingId={id} onReviewAdded={handleReviewAdded} />
              </div>
            )}

            {listing.reviews?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
                {listing.reviews.map(review => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    listingId={id}
                    onDelete={handleReviewDeleted}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT COLUMN: Sticky Booking Panel ─────────────────── */}
        <div style={{ position: 'sticky', top: 120, className: 'listing-show-sticky' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Price Header */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                ₹{listing.price?.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/ month</span>
            </div>

            {/* Quick stats box */}
            <div style={{ 
              border: '1px solid var(--border-default)', 
              borderRadius: 8, 
              marginBottom: 16,
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
                <div style={{ flex: 1, padding: '10px 12px', borderRight: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Check-in</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : 'Immediate'}
                  </div>
                </div>
                <div style={{ flex: 1, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Property</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    {listing.listingType}
                  </div>
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Guests</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {listing.maxGuests || 1} {listing.maxGuests === 1 ? 'guest' : 'guests'} maximum
                </div>
              </div>
            </div>

            {/* CTA button */}
            {isOwner ? (
              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 8, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                This is your property
              </div>
            ) : (
              <>
                <button
                  id="reserve-btn"
                  onClick={() => setShowBooking(true)}
                  style={{
                    width: '100%', height: 48,
                    background: 'var(--brand-600)',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 16, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--brand-700)'}
                  onMouseLeave={e => e.target.style.background = 'var(--brand-600)'}
                >
                  Reserve
                </button>
                <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: '16px 0 24px' }}>
                  You won't be charged yet
                </p>
              </>
            )}

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid var(--border-default)', paddingBottom: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'var(--text-secondary)' }}>
                <span style={{ textDecoration: 'underline' }}>₹{listing.price?.toLocaleString('en-IN')} x 1 month</span>
                <span>₹{listing.price?.toLocaleString('en-IN')}</span>
              </div>
              {listing.securityDeposit > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'var(--text-secondary)' }}>
                  <span style={{ textDecoration: 'underline' }}>Security Deposit</span>
                  <span>₹{listing.securityDeposit?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              <span>Total due upfront</span>
              <span>₹{((listing.price || 0) + (listing.securityDeposit || 0)).toLocaleString('en-IN')}</span>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border-default)', display: 'flex', gap: 12 }}>
                <Link
                  to={`/listings/${id}/edit`}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Edit3 size={16} /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger"
                  style={{ flex: 1 }}
                >
                  <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && listing && (
        <BookingModal listing={listing} onClose={() => setShowBooking(false)} />
      )}
    </div>
  )
}
