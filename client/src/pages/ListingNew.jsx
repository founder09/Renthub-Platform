import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { createListing } from '../api/listingsApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const COLLEGES = [
  '', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]
const AMENITIES_LIST = ['WiFi', 'AC', 'Meals', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Furnished']
const AMENITY_ICONS = { WiFi: '📶', AC: '❄️', Meals: '🍽', Laundry: '🫧', Parking: '🅿️', Gym: '💪', CCTV: '📹', Furnished: '🛋' }

export default function ListingNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting,      setSubmitting]      = useState(false)
  const [previews,        setPreviews]        = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])

  if (user?.role === 'owner' && !user?.isVerified) {
    return (
      <div className="container-main max-w-3xl text-center py-20 fade-in-up">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--danger)' }}>Account Verification Pending</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Your owner account is currently pending verification by an administrator.
          You will be able to create listings once your document proof has been approved.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-block">Go to Dashboard</Link>
      </div>
    )
  }

  const toggleAmenity = (a) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const onSubmit = async (data) => {
    if (!data.images || data.images.length < 4) {
      toast.error('Please upload at least 4 photos')
      return
    }
    if (data.images.length > 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'images') {
          Array.from(v).forEach(file => formData.append('images', file))
        } else {
          formData.append(k, v)
        }
      })
      formData.append('amenities', selectedAmenities.join(','))
      
      const { data: res } = await createListing(formData)
      toast.success('🎉 Listing created!')
      navigate(`/listings/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-main max-w-3xl">
      <nav className="text-sm mb-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <Link to="/listings" className="hover:text-rose-500 transition-colors">Listings</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Add New</span>
      </nav>

      <div className="card p-8 fade-in-up">
        <h1 className="page-title mb-1">🏠 Add a New Listing</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Fill in the details to list your property for students.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
            
            <div>
              <label className="label" htmlFor="title">Title *</label>
              <input id="title" className={`input ${errors.title ? 'border-red-400' : ''}`}
                placeholder="Cozy PG near IIT Delhi…"
                {...register('title', { required: 'Title is required' })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="description">Description *</label>
              <textarea id="description" rows={4} className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
                placeholder="Describe your property, nearby amenities, and what makes it special…"
                {...register('description', { required: 'Description is required' })} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label" htmlFor="listingType">Property Type</label>
                <select id="listingType" className="input" {...register('listingType')}>
                  <option value="Room">🛏 Room</option>
                  <option value="PG">🏠 PG</option>
                  <option value="Flat">🏢 Flat</option>
                  <option value="Hostel">🏫 Hostel</option>
                  <option value="Studio">🎨 Studio</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="gender">Gender Rule</label>
                <select id="gender" className="input" {...register('gender')}>
                  <option value="Any">👥 Any</option>
                  <option value="Male">👨 Male Only</option>
                  <option value="Female">👩 Female Only</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="bedrooms">Bedrooms</label>
                <input id="bedrooms" type="number" min="0" className="input" defaultValue="1" {...register('bedrooms')} />
              </div>
              <div>
                <label className="label" htmlFor="bathrooms">Bathrooms</label>
                <input id="bathrooms" type="number" min="0" className="input" defaultValue="1" {...register('bathrooms')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="maxGuests">Max Guests</label>
                <input id="maxGuests" type="number" min="1" className="input" defaultValue="1" {...register('maxGuests')} />
              </div>
              <div>
                <label className="label" htmlFor="floorSize">Floor Size (sq ft)</label>
                <input id="floorSize" type="number" min="0" className="input" placeholder="e.g. 500" {...register('floorSize')} />
              </div>
            </div>
          </section>

          {/* Section 2: Pricing & Location */}
          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pricing & Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="price">Monthly Rent (₹) *</label>
                <input id="price" type="number" min="0" className={`input ${errors.price ? 'border-red-400' : ''}`}
                  placeholder="8000"
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="securityDeposit">Security Deposit (₹)</label>
                <input id="securityDeposit" type="number" min="0" className="input" placeholder="e.g. 16000" {...register('securityDeposit')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="location">Location (City, Area) *</label>
                <input id="location" className={`input ${errors.location ? 'border-red-400' : ''}`}
                  placeholder="Hauz Khas, New Delhi"
                  {...register('location', { required: 'Location is required' })} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="country">Country *</label>
                <input id="country" className={`input ${errors.country ? 'border-red-400' : ''}`}
                  placeholder="India" defaultValue="India"
                  {...register('country', { required: 'Country is required' })} />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="nearCollege">Near College</label>
              <select id="nearCollege" className="input" {...register('nearCollege')}>
                {COLLEGES.map(c => <option key={c} value={c}>{c || '— Select college —'}</option>)}
              </select>
            </div>
          </section>

          {/* Section 3: Amenities & Rules */}
          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Amenities & Rules</h2>

            <div>
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(a => (
                  <button key={a} type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`chip ${selectedAmenities.includes(a) ? 'active' : ''}`}>
                    {AMENITY_ICONS[a]} {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="houseRules">House Rules (Comma separated)</label>
                <input id="houseRules" className="input" placeholder="No smoking, No pets, Quiet after 10 PM" {...register('houseRules')} />
              </div>
              <div>
                <label className="label" htmlFor="availableFrom">Available From</label>
                <input id="availableFrom" type="date" className="input" {...register('availableFrom')} />
              </div>
            </div>
          </section>

          {/* Section 4: Contact & Image */}
          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Contact & Media</h2>
            <p className="text-xs text-slate-500 mb-4">Contact details will be visible to students who express interest.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="contactName">Contact Name</label>
                <input id="contactName" className="input" placeholder="John Doe" {...register('contactName')} />
              </div>
              <div>
                <label className="label" htmlFor="contactPhone">Phone Number</label>
                <input id="contactPhone" className="input" placeholder="+91 9876543210" {...register('contactPhone')} />
              </div>
              <div>
                <label className="label" htmlFor="contactEmail">Email</label>
                <input id="contactEmail" type="email" className="input" placeholder="john@example.com" {...register('contactEmail')} />
              </div>
              <div>
                <label className="label" htmlFor="contactWhatsapp">WhatsApp (optional)</label>
                <input id="contactWhatsapp" className="input" placeholder="+91 9876543210" {...register('contactWhatsapp')} />
              </div>
            </div>

            <div>
              <label className="label">Upload Photos (Min 4, Max 5) *</label>
              <div className="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-rose-400"
                style={{ borderColor: 'var(--border-default)' }}>
                {previews.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p} alt={`Preview ${i}`} className="h-24 w-full object-cover rounded-xl" />
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded">Cover</span>}
                      </div>
                    ))}
                    <button type="button" onClick={() => { setPreviews([]); document.getElementById('images').value = '' }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 shadow-md flex items-center justify-center">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>
                    <span className="text-4xl block mb-2">📷</span>
                    <span className="text-sm font-medium">Click to upload 4 to 5 photos</span>
                    <span className="block text-xs mt-1 opacity-70">The first photo will be the cover</span>
                  </div>
                )}
                <input id="images" type="file" multiple accept="image/*" className={`absolute inset-0 opacity-0 cursor-pointer ${previews.length > 0 ? 'hidden' : ''}`}
                  {...register('images', { required: 'At least 4 photos are required' })}
                  onChange={(e) => {
                    register('images').onChange(e)
                    const files = Array.from(e.target.files)
                    if (files.length > 0) {
                      const newPreviews = files.slice(0, 5).map(f => URL.createObjectURL(f))
                      setPreviews(newPreviews)
                    }
                  }} />
              </div>
              {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>}
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link to="/listings" className="btn-secondary flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : '🚀 Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
