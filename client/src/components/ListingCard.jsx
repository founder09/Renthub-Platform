import { Link } from 'react-router-dom'
import {
  Wifi, Wind, Utensils, Shirt, Car, Dumbbell,
  Camera, Sofa, MapPin, Star, ShieldCheck, Heart,
  Home, Building2, School, Layers, Palette, TrendingUp
} from 'lucide-react'

/* ── Constants ────────────────────────────────────────────────────────── */
export const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]

export const TYPE_META = {
  Room:   { icon: <Home      size={11} />, label: 'Room',   color: '#6366f1', bg: 'rgba(99,102,241,0.12)',   border: 'rgba(99,102,241,0.25)'  },
  PG:     { icon: <Layers    size={11} />, label: 'PG',     color: '#0891b2', bg: 'rgba(8,145,178,0.12)',    border: 'rgba(8,145,178,0.25)'   },
  Flat:   { icon: <Building2 size={11} />, label: 'Flat',   color: '#d97706', bg: 'rgba(217,119,6,0.12)',    border: 'rgba(217,119,6,0.25)'   },
  Hostel: { icon: <School    size={11} />, label: 'Hostel', color: '#059669', bg: 'rgba(5,150,105,0.12)',    border: 'rgba(5,150,105,0.25)'   },
  Studio: { icon: <Palette   size={11} />, label: 'Studio', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',   border: 'rgba(124,58,237,0.25)'  },
}

export const AMENITY_ICONS = {
  WiFi:      <Wifi      size={12} />,
  AC:        <Wind      size={12} />,
  Meals:     <Utensils  size={12} />,
  Laundry:   <Shirt     size={12} />,
  Parking:   <Car       size={12} />,
  Gym:       <Dumbbell  size={12} />,
  CCTV:      <Camera    size={12} />,
  Furnished: <Sofa      size={12} />,
}

const FALLBACK = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'

/* ── StarRating ─────────────────────────────────────────────────────────── */
function StarRating({ rating, count }) {
  const stars = Math.round(Number(rating))
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={10}
            fill={i <= stars ? '#f59e0b' : 'none'}
            stroke={i <= stars ? '#f59e0b' : '#cbd5e1'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{rating}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({count})</span>
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function ListingCard({ listing, savedIds = [], onToggleSave }) {
  const {
    _id, title, description, image, price, location, country,
    listingType = 'Room', amenities = [], nearCollege, gender,
    isFeatured, owner, reviews = [],
  } = listing

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  const isSaved  = savedIds.includes(_id)
  const typeMeta = TYPE_META[listingType] || TYPE_META.Room

  return (
    <article
      className="listing-card"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s cubic-bezier(.22,1,.36,1), border-color 0.25s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      <style>{`
        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06) !important;
          border-color: var(--border-strong) !important;
        }
        .listing-card:hover .card-img {
          transform: scale(1.06);
        }
        .listing-card .wishlist-btn { opacity: 0; transform: scale(0.8); }
        .listing-card:hover .wishlist-btn { opacity: 1; transform: scale(1); }
        .wishlist-btn.saved { opacity: 1 !important; transform: scale(1) !important; }
      `}</style>

      {/* ── Image ───────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#f1f5f9' }}>
        <Link to={`/listings/${_id}`} style={{ display: 'block', height: '100%' }}>
          <img
            src={image?.url || FALLBACK}
            alt={title}
            className="card-img"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.55s cubic-bezier(.22,1,.36,1)',
            }}
            onError={e => { e.target.src = FALLBACK }}
          />
        </Link>

        {/* Top-left: Featured + Type badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isFeatured && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#fff', borderRadius: 8, padding: '3px 9px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
            }}>
              <TrendingUp size={9} /> FEATURED
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        {onToggleSave && (
          <button
            onClick={e => { e.preventDefault(); onToggleSave(_id) }}
            className={`wishlist-btn${isSaved ? ' saved' : ''}`}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              border: 'none', cursor: 'pointer',
              transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(.34,1.56,.64,1)',
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <Heart
              size={15}
              fill={isSaved ? '#ef4444' : 'none'}
              stroke={isSaved ? '#ef4444' : '#64748b'}
              strokeWidth={2}
            />
          </button>
        )}

        {/* Price gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          padding: '28px 14px 12px',
        }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: 0, lineHeight: 1 }}>
            ₹{price?.toLocaleString('en-IN')}
            <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginLeft: 3 }}>/mo</span>
          </p>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <Link
        to={`/listings/${_id}`}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '14px 16px 16px', gap: 10, textDecoration: 'none' }}
      >
        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: typeMeta.bg, color: typeMeta.color,
            border: `1px solid ${typeMeta.border}`,
            borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600,
          }}>
            {typeMeta.icon} {typeMeta.label}
          </span>

          {gender && gender !== 'Any' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--bg-subtle)', color: 'var(--text-muted)',
              border: '1px solid var(--border-default)',
              borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 500,
            }}>
              {gender === 'Male' ? '♂' : '♀'} {gender}
            </span>
          )}

          {owner?.isVerified && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(16,185,129,0.1)', color: '#059669',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600,
            }}>
              <ShieldCheck size={10} /> Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          margin: 0, fontWeight: 700, fontSize: 14, lineHeight: 1.4,
          color: 'var(--text-primary)',
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          transition: 'color 0.15s',
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {description || 'No description provided.'}
        </p>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {amenities.slice(0, 4).map(a => (
              <span key={a} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 500,
                padding: '2px 7px', borderRadius: 5,
                background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
              }}>
                {AMENITY_ICONS[a]} {a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                background: 'var(--brand-50)', color: 'var(--brand-600)',
                border: '1px solid var(--brand-100)',
              }}>
                +{amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-default)', margin: '2px 0' }} />

        {/* Footer: location + rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', minWidth: 0 }}>
            <MapPin size={11} style={{ flexShrink: 0, color: 'var(--brand-500)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
              {location}{country ? `, ${country}` : ''}
            </span>
          </div>
          {avgRating
            ? <StarRating rating={avgRating} count={reviews.length} />
            : (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
              }}>
                New
              </span>
            )
          }
        </div>

        {/* College tag */}
        {nearCollege && (
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 600,
            color: 'var(--brand-500)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <School size={11} /> Near {nearCollege}
          </p>
        )}
      </Link>
    </article>
  )
}
