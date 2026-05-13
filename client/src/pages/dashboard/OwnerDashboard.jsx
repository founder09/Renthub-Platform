import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Eye, Heart, TrendingUp, Building2, Sparkles, BarChart2, Crown, Zap } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useSubscription } from '../../context/SubscriptionContext';

const data = [
  { name: 'Jan', views: 4000, inquiries: 2400 },
  { name: 'Feb', views: 3000, inquiries: 1398 },
  { name: 'Mar', views: 2000, inquiries: 9800 },
  { name: 'Apr', views: 2780, inquiries: 3908 },
  { name: 'May', views: 1890, inquiries: 4800 },
  { name: 'Jun', views: 2390, inquiries: 3800 },
  { name: 'Jul', views: 3490, inquiries: 4300 },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { planId, isPro } = useSubscription() || {};
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile')
      .then(res => setListings(res.data.data.myListings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Quick stats
  const stats = [
    { title: 'Total Properties', value: listings.length, icon: <Building2 size={20} />, trend: '+2 this month' },
    { title: 'Total Views', value: '24.5K', icon: <Eye size={20} />, trend: '+14% from last month' },
    { title: 'Saves / Wishlisted', value: '1,240', icon: <Heart size={20} />, trend: '+5% from last month' },
    { title: 'Active Inquiries', value: '48', icon: <TrendingUp size={20} />, trend: '+12 new this week' },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header + Plan Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.username}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your properties today.</p>
        </div>
        <Link to="/dashboard/subscription" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: isPro ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-subtle)', color: isPro ? '#fff' : 'var(--text-secondary)', borderRadius: 99, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid var(--border-default)' }}>
          <Crown size={13} /> {planId === 'business' ? 'Business' : isPro ? 'Pro' : 'Free'} Plan
          {!isPro && <span style={{ color: '#6366f1', marginLeft: 2 }}>· Upgrade</span>}
        </Link>
      </div>

      {/* Phase 3 Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { to: '/dashboard/analytics', icon: <BarChart2 size={18} />, label: 'Analytics', desc: 'Revenue & booking trends', color: '#6366f1', locked: !isPro },
          { to: '/dashboard/ai-tools', icon: <Sparkles size={18} />, label: 'AI Tools', desc: 'Smart description generator', color: '#8b5cf6', locked: !isPro },
          { to: '/dashboard/subscription', icon: <Crown size={18} />, label: 'Subscription', desc: planId === 'free' ? 'Upgrade for more features' : 'Manage plan', color: '#f59e0b', locked: false },
          { to: '/dashboard/bookings', icon: <TrendingUp size={18} />, label: 'Bookings', desc: 'Manage reservation requests', color: '#10b981', locked: false },
        ].map((c, i) => (
          <Link key={i} to={c.to} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 14, textDecoration: 'none', transition: 'all 0.15s',
            position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 4px 16px ${c.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {c.label}
                {c.locked && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: '#fef3c7', color: '#92400e' }}>PRO</span>}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {stat.icon}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
              <p className="text-sm text-slate-500">Views vs Inquiries over the last 6 months</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 outline-none">
              <option>Last 6 months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="inquiries" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorInquiries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Properties list */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Properties</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '350px' }}>
            {loading ? (
              <p className="text-sm text-slate-500">Loading properties...</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 mb-4">No properties listed yet.</p>
                <a href="/listings/new" className="text-sm font-medium text-indigo-600 hover:underline">Add your first property</a>
              </div>
            ) : (
              listings.slice(0, 5).map((listing) => (
                <a href={`/listings/${listing._id}`} key={listing._id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={listing.image?.url || listing.image?.[0]?.url || 'https://via.placeholder.com/150'} alt={listing.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <MapPin size={12} /> {listing.location}
                    </p>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-300 mt-1">₹{listing.price.toLocaleString('en-IN')}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
