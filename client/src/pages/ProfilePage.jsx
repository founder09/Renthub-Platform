import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const COLLEGES = [
  '', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]

const FALLBACK = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ phone: '', college: '' })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/profile').then(r => {
      setProfile(r.data.data)
      setForm({ phone: r.data.data.phone || '', college: r.data.data.college || '' })
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false))
  }, [user, navigate])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/profile', form)
      setProfile(prev => ({ ...prev, ...form }))
      setEditing(false)
      toast.success('Profile updated! ✅')
    } catch {
      toast.error('Failed to update profile')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return null

  const initials = profile.username?.slice(0, 2).toUpperCase() || '?'
  const myListings = profile.myListings || []
  const savedListings = profile.savedListings || []

  return (
    <div className="container-main max-w-5xl">
      <h1 className="page-title mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Profile Card ─────────────────────────────── */}
        <div className="space-y-6">
          <div className="card p-6 text-center fade-in-up">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#a855f7)' }}>
                {initials}
              </div>
              {profile.isVerified && (
                <span className="absolute -bottom-1 -right-1 text-xl">✅</span>
              )}
            </div>

            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.username}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>

            {profile.college && (
              <span className="inline-block mt-2 badge badge-blue">🎓 {profile.college}</span>
            )}

            {!profile.isVerified && (
              <div className="mt-4 p-3 rounded-xl text-xs text-center"
                style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                ⚠️ Verification coming soon
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card p-5 fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>📊 My Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'My Listings', value: myListings.length, icon: '🏠' },
                { label: 'Saved', value: savedListings.length, icon: '❤️' },
                { label: 'Total Views', value: myListings.reduce((s, l) => s + (l.viewCount || 0), 0), icon: '👁' },
                { label: 'Reviews', value: myListings.reduce((s, l) => s + (l.reviews?.length || 0), 0), icon: '⭐' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.icon} {s.label}</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit profile */}
          <div className="card p-5 fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>✏️ Edit Profile</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-xs text-rose-500 hover:underline">Edit</button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label text-xs">Phone Number</label>
                  <input className="input text-sm py-2" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">College</label>
                  <select className="input text-sm py-2" value={form.college}
                    onChange={e => setForm(f => ({ ...f, college: e.target.value }))}>
                    {COLLEGES.map(c => <option key={c} value={c}>{c || '— None —'}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-xs py-2">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs py-2">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <p>📱 {profile.phone || 'No phone added'}</p>
                <p>🎓 {profile.college || 'No college selected'}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Listings ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Listings */}
          <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                🏠 My Listings ({myListings.length})
              </h2>
              <Link to="/listings/new" className="btn-primary text-sm py-2 px-4">+ Add</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-3">🏘</div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No listings yet</p>
                <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                  Start earning by listing your property
                </p>
                <Link to="/listings/new" className="btn-primary">Create First Listing</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map(l => (
                  <div key={l._id} className="card p-4 flex gap-4 items-center hover:shadow-md transition-all">
                    <img src={l.image?.url || FALLBACK} alt={l.title}
                      className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={e => e.target.src = FALLBACK} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        📍 {l.location}, {l.country} · ₹{l.price?.toLocaleString('en-IN')}/mo
                      </p>
                      <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>👁 {l.viewCount || 0} views</span>
                        <span>⭐ {l.reviews?.length || 0} reviews</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link to={`/listings/${l._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                      <Link to={`/listings/${l._id}`} className="btn-ghost text-xs py-1.5 px-3">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Listings */}
          {savedListings.length > 0 && (
            <div className="fade-in-up" style={{ animationDelay: '300ms' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ❤️ Saved Listings ({savedListings.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedListings.map(l => (
                  <Link key={l._id} to={`/listings/${l._id}`}
                    className="card p-3 flex gap-3 items-center hover:shadow-md transition-all">
                    <img src={l.image?.url || FALLBACK} alt={l.title}
                      className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={e => e.target.src = FALLBACK} />
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ₹{l.price?.toLocaleString('en-IN')}/mo · {l.listingType}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
