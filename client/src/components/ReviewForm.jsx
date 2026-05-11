import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createReview } from '../api/reviewsApi'
import toast from 'react-hot-toast'

const STARS = [1, 2, 3, 4, 5]

export default function ReviewForm({ listingId, onReviewAdded }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [hovered,     setHovered]     = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [submitting,  setSubmitting]  = useState(false)

  const onSubmit = async (data) => {
    if (!selectedRating) { toast.error('Please select a star rating'); return }
    setSubmitting(true)
    try {
      const { data: res } = await createReview(listingId, { ...data, rating: selectedRating })
      toast.success('Review added!')
      onReviewAdded(res.data)
      reset()
      setSelectedRating(0)
      setHovered(0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-900">Leave a Review</h3>

      {/* Star picker */}
      <div>
        <p className="label">Rating</p>
        <div className="flex gap-1">
          {STARS.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95"
              aria-label={`${star} star`}
            >
              <span className={(hovered || selectedRating) >= star ? 'text-amber-400' : 'text-slate-200'}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="label" htmlFor="comment">Your Comment</label>
        <textarea
          id="comment"
          rows={3}
          className={`input resize-none ${errors.comment ? 'border-red-400 focus:ring-red-400' : ''}`}
          placeholder="Share your experience…"
          {...register('comment', { required: 'Comment is required' })}
        />
        {errors.comment && (
          <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
