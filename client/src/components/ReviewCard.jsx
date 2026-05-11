import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { deleteReview } from '../api/reviewsApi'
import toast from 'react-hot-toast'
import { Star, Trash2 } from 'lucide-react'

const STARS = [1, 2, 3, 4, 5]

export default function ReviewCard({ review, listingId, onDelete }) {
  const { user }    = useAuth()
  const [deleting, setDeleting] = useState(false)
  const isAuthor = user && review.author?._id === user.id

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return
    setDeleting(true)
    try {
      await deleteReview(listingId, review._id)
      toast.success('Review deleted')
      onDelete(review._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  const initials = review.author?.username?.[0]?.toUpperCase() || '?'
  const dateStr  = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  // Avatar gradient seed from username
  const colors = [
    ['#6366f1','#8b5cf6'], ['#0891b2','#06b6d4'], ['#059669','#10b981'],
    ['#d97706','#f59e0b'], ['#e11d48','#f43f5e'],
  ]
  const seed = (review.author?.username?.charCodeAt(0) || 0) % colors.length
  const [c1, c2] = colors[seed]

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 18,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      className="review-card-item"
    >
      <style>{`
        .review-card-item:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {/* Author info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
            boxShadow: `0 2px 8px ${c1}40`,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {review.author?.username || 'Anonymous'}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{dateStr}</p>
          </div>
        </div>

        {/* Stars + delete */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 2 }}>
            {STARS.map(s => (
              <Star
                key={s} size={14}
                fill={s <= review.rating ? '#f59e0b' : 'none'}
                stroke={s <= review.rating ? '#f59e0b' : 'var(--border-strong)'}
                strokeWidth={1.5}
              />
            ))}
          </div>

          {/* Rating pill */}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px',
            borderRadius: 6,
            background: review.rating >= 4 ? 'rgba(16,185,129,0.1)' : review.rating >= 3 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
            color: review.rating >= 4 ? '#059669' : review.rating >= 3 ? '#d97706' : '#ef4444',
            border: `1px solid ${review.rating >= 4 ? 'rgba(16,185,129,0.2)' : review.rating >= 3 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {review.rating}/5
          </span>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p style={{
          margin: '14px 0 0', fontSize: 13, lineHeight: 1.7,
          color: 'var(--text-secondary)',
        }}>
          {review.comment}
        </p>
      )}

      {/* Delete */}
      {isAuthor && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#ef4444',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '4px 10px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <Trash2 size={11} /> {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}
