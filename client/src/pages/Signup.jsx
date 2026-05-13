import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { RentHubMark } from '../components/Logo'
import { Eye, EyeOff, ShieldCheck, GraduationCap, Zap, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const COLLEGES = [
  '', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute', 'Anna University',
]

const PERKS = [
  { icon: <Zap size={16} />, text: 'Free forever for students' },
  { icon: <ShieldCheck size={16} />, text: 'Verified listings only' },
  { icon: <GraduationCap size={16} />, text: 'Campus-specific search' },
]

export default function Signup() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'tenant' } })
  const [submitting, setSubmitting] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('username', data.username)
      formData.append('email', data.email)
      formData.append('password', data.password)
      if (data.college) formData.append('college', data.college)
      formData.append('role', data.role)
      if (data.role === 'owner' && data.ownerProof?.[0]) {
        formData.append('ownerProof', data.ownerProof[0])
      }

      await authRegister(formData)
      toast.success('Account created successfully!')
      navigate('/listings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Right decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden order-last"
        style={{ background: 'linear-gradient(160deg, #0b0f1a 0%, #1e1b4b 60%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full opacity-20 blur-3xl"
          style={{ background: '#06b6d4' }} />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <RentHubMark size={34} />
            <span className="text-xl font-extrabold text-white">RentHub</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-2xl font-bold text-white leading-snug">
            Join thousands of students finding their perfect home near campus
          </h2>
          <div className="space-y-4">
            {PERKS.map(p => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                  {p.icon}
                </div>
                <p className="text-sm font-medium text-white">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: '#475569' }}>
          Trusted by students across IIT, NIT, DU, VIT and more.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-sm fade-in-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2.5">
              <RentHubMark size={30} />
              <span className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Rent<span style={{ color: 'var(--brand-600)' }}>Hub</span>
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Free forever · No credit card required
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="label" htmlFor="su-username">Username</label>
              <input id="su-username" autoComplete="username"
                className={`input ${errors.username ? 'error' : ''}`}
                placeholder="johndoe"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and underscores only' }
                })} />
              {errors.username && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="su-email">Email address</label>
              <input id="su-email" type="email" autoComplete="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="you@college.edu"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' }
                })} />
              {errors.email && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">I am a...</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-xl flex-1 justify-center transition-colors hover:border-indigo-500 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  <input type="radio" value="tenant" className="accent-indigo-600" {...register('role', { required: 'Please select a role' })} defaultChecked />
                  🎓 Student / Tenant
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-xl flex-1 justify-center transition-colors hover:indigo-500 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  <input type="radio" value="owner" className="accent-indigo-600" {...register('role')} />
                  🏠 Landlord / Owner
                </label>
              </div>
              {errors.role && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.role.message}</p>}
            </div>

            {watch('role') === 'owner' && (
              <div className="fade-in-up">
                <label className="label" htmlFor="su-ownerProof">Owner ID / Document Proof</label>
                <input id="su-ownerProof" type="file" accept="image/*"
                  className={`input p-2 ${errors.ownerProof ? 'error' : ''}`}
                  {...register('ownerProof', { required: 'Owner proof is required for verification' })} />
                {errors.ownerProof && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.ownerProof.message}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Admin will verify this document.</p>
              </div>
            )}

            <div>
              <label className="label" htmlFor="su-college">College (optional, for students)</label>
              <select id="su-college" className="input" style={{ height: 42 }} {...register('college')}>
                {COLLEGES.map(c => <option key={c} value={c}>{c || '— Select your college —'}</option>)}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="su-password">Password</label>
              <div className="relative">
                <input id="su-password" type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="Min 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg gap-2 mt-2">
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>Create Free Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 divider" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
            <div className="flex-1 divider" />
          </div>

          <Link to="/login" className="btn-secondary w-full justify-center">
            Sign In
          </Link>

          <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-indigo-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-indigo-500">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
