import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { RentHubMark } from '../components/Logo'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [showPass,   setShowPass]   = useState(false)

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/listings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Left panel — decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0b0f1a 0%, #1e1b4b 60%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: '#6366f1' }} />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <RentHubMark size={34} />
            <span className="text-xl font-extrabold text-white">RentHub</span>
          </div>
        </div>

        <div className="relative">
          <blockquote className="text-lg font-medium text-white leading-relaxed mb-4">
            "Found my PG near IIT Delhi in 10 minutes. The verified listings gave me complete peace of mind."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'var(--brand-600)' }}>A</div>
            <div>
              <p className="text-sm font-semibold text-white">Aarav Mehta</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>IIT Delhi, B.Tech CSE</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-4">
          {['5,200+ students', '340+ landlords', '10 colleges'].map(t => (
            <div key={t} className="text-center">
              <p className="text-xs font-semibold text-white">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
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
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                autoComplete="username"
                className={`input ${errors.username ? 'error' : ''}`}
                placeholder="johndoe"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg gap-2">
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 divider" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>New to RentHub?</span>
            <div className="flex-1 divider" />
          </div>

          <Link to="/signup" className="btn-secondary w-full justify-center">
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  )
}
