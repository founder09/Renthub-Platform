import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getPrivateListing, updateListing } from '../api/listingsApi'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const FALLBACK = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80'

const COLLEGES = [
  '', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]
const AMENITIES_LIST = ['WiFi', 'AC', 'Meals', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Furnished']
const AMENITY_ICONS = { WiFi: '📶', AC: '❄️', Meals: '🍽', Laundry: '🫧', Parking: '🅿️', Gym: '💪', CCTV: '📹', Furnished: '🛋' }

export default function ListingEdit() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [listing,    setListing]   = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [previews,   setPreviews]   = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getPrivateListing(id)
        const l = data.data
        setListing(l)
        setSelectedAmenities(l.amenities || [])
        reset({
          title:       l.title,
          description: l.description,
          listingType: l.listingType,
          gender:      l.gender,
          bedrooms:    l.bedrooms,
          bathrooms:   l.bathrooms,
          maxGuests:   l.maxGuests,
          floorSize:   l.floorSize,
          price:       l.price,
          securityDeposit: l.securityDeposit,
          location:    l.location,
          country:     l.country,
          nearCollege: l.nearCollege,
          houseRules:  (l.houseRules || []).join(', '),
          availableFrom: l.availableFrom ? new Date(l.availableFrom).toISOString().split('T')[0] : '',
          contactName: l.ownerContact?.name || '',
          contactPhone: l.ownerContact?.phone || '',
          contactEmail: l.ownerContact?.email || '',
          contactWhatsapp: l.ownerContact?.whatsapp || '',
        })
      } catch (err) {
        toast.error('Listing not found or access denied')
        navigate('/listings')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, navigate, reset])

  const toggleAmenity = (a) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'images') {
          if (v && v.length > 0) {
            Array.from(v).forEach(file => formData.append('images', file))
          }
        } else {
          formData.append(k, v)
        }
      })
      formData.append('amenities', selectedAmenities.join(','))
      await updateListing(id, formData)
      toast.success('Listing updated!')
      navigate(`/listings/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container-main max-w-3xl">
      <nav className="text-sm text-slate-400 mb-6 flex items-center gap-2">
        <Link to="/listings"      className="hover:text-rose-500 transition-colors">Listings</Link>
        <span>›</span>
        <Link to={`/listings/${id}`} className="hover:text-rose-500 transition-colors truncate max-w-[10rem]">{listing?.title}</Link>
        <span>›</span>
        <span className="text-slate-700 font-medium">Edit</span>
      </nav>

      <div className="card p-8 fade-in-up">
        <h1 className="page-title mb-1">Edit Listing</h1>
        <p className="text-slate-500 text-sm mb-8">Update your property details below.</p>

        {listing?.image?.url && previews.length === 0 && (
          <div className="mb-6">
            <p className="label mb-2">Current Photos</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <img src={listing.image.url.replace('/upload', '/upload/w_600')} alt="Cover" className="h-24 w-full object-cover rounded-xl border border-slate-100" onError={(e) => { e.target.src = FALLBACK }} />
              {listing.roomImages?.map((img, i) => (
                <img key={i} src={img.url.replace('/upload', '/upload/w_600')} alt={`Room ${i+1}`} className="h-24 w-full object-cover rounded-xl border border-slate-100" onError={(e) => { e.target.src = FALLBACK }} />
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Basic Information</h2>
            
            <div>
              <label className="label" htmlFor="title">Title *</label>
              <input id="title" className={`input ${errors.title ? 'border-red-400' : ''}`}
                {...register('title', { required: 'Title is required' })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="description">Description *</label>
              <textarea id="description" rows={4} className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
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
                <input id="bedrooms" type="number" min="0" className="input" {...register('bedrooms')} />
              </div>
              <div>
                <label className="label" htmlFor="bathrooms">Bathrooms</label>
                <input id="bathrooms" type="number" min="0" className="input" {...register('bathrooms')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="maxGuests">Max Guests</label>
                <input id="maxGuests" type="number" min="1" className="input" {...register('maxGuests')} />
              </div>
              <div>
                <label className="label" htmlFor="floorSize">Floor Size (sq ft)</label>
                <input id="floorSize" type="number" min="0" className="input" {...register('floorSize')} />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pricing & Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="price">Monthly Rent (₹) *</label>
                <input id="price" type="number" min="0" className={`input ${errors.price ? 'border-red-400' : ''}`}
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="securityDeposit">Security Deposit (₹)</label>
                <input id="securityDeposit" type="number" min="0" className="input" {...register('securityDeposit')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="location">Location (City, Area) *</label>
                <input id="location" className={`input ${errors.location ? 'border-red-400' : ''}`}
                  {...register('location', { required: 'Location is required' })} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="country">Country *</label>
                <input id="country" className={`input ${errors.country ? 'border-red-400' : ''}`}
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
                <input id="houseRules" className="input" {...register('houseRules')} />
              </div>
              <div>
                <label className="label" htmlFor="availableFrom">Available From</label>
                <input id="availableFrom" type="date" className="input" {...register('availableFrom')} />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-b pb-6" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Contact & Media</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="contactName">Contact Name</label>
                <input id="contactName" className="input" {...register('contactName')} />
              </div>
              <div>
                <label className="label" htmlFor="contactPhone">Phone Number</label>
                <input id="contactPhone" className="input" {...register('contactPhone')} />
              </div>
              <div>
                <label className="label" htmlFor="contactEmail">Email</label>
                <input id="contactEmail" type="email" className="input" {...register('contactEmail')} />
              </div>
              <div>
                <label className="label" htmlFor="contactWhatsapp">WhatsApp (optional)</label>
                <input id="contactWhatsapp" className="input" {...register('contactWhatsapp')} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="images">Replace Photos (Min 4, Max 5, Optional)</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-rose-400 transition-colors text-center cursor-pointer">
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
                  <div className="text-slate-400 text-sm">📷 Click to upload new photos (overwrites current)</div>
                )}
                <input id="images" type="file" multiple accept="image/*" className={`absolute inset-0 opacity-0 cursor-pointer ${previews.length > 0 ? 'hidden' : ''}`}
                  {...register('images')}
                  onChange={(e) => {
                    register('images').onChange(e)
                    const files = Array.from(e.target.files)
                    if (files.length > 0) {
                      setPreviews(files.slice(0, 5).map(f => URL.createObjectURL(f)))
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <Link to={`/listings/${id}`} className="btn-secondary flex-1 text-center">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
