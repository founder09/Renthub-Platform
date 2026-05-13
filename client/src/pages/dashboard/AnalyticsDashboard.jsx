import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerAnalytics, getTenantAnalytics } from '../../api/analyticsApi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Home, Calendar, Users, RefreshCw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({ icon, label, value, sub, color = '#6366f1', trend }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? '#10b981' : '#ef4444', background: trend >= 0 ? '#ecfdf5' : '#fef2f2', padding: '2px 8px', borderRadius: 99, flexShrink: 0, marginTop: 2 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

function ChartCard({ title, children, locked = false, lockMsg }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        {locked && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 99 }}>
            <Lock size={11} /> Pro
          </span>
        )}
      </div>
      <div style={{ padding: 20 }}>
        {locked ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{lockMsg || 'Upgrade to Pro to unlock advanced analytics'}</p>
            <a href="/dashboard/subscription" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>Upgrade →</a>
          </div>
        ) : children}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', fontSize: 13, color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? (p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('spent') ? `₹${p.value.toLocaleString('en-IN')}` : p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── OWNER ANALYTICS ───────────────────────────────────────────────────────────
function OwnerAnalyticsDashboard({ planId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPro = planId === 'pro' || planId === 'business';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await getOwnerAnalytics();
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 100, background: 'var(--bg-muted)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>No analytics data yet.</p>;

  const { summary, earningsChart, bookingStatusChart, topListings, recentBookings } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Business intelligence for your properties</p>
        </div>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-muted)', border: '1px solid var(--border-default)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={<Home size={22} />} label="Total Listings" value={summary.totalListings} color="#6366f1" />
        <StatCard icon={<Calendar size={22} />} label="Total Bookings" value={summary.totalBookings} color="#22d3ee" />
        <StatCard icon={<DollarSign size={22} />} label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString('en-IN')}`} color="#10b981" />
        <StatCard icon={<Users size={22} />} label="Pending Requests" value={summary.pendingRequests} color="#f59e0b" sub={`${summary.cancellationRate}% cancellation rate`} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: isPro ? '2fr 1fr' : '1fr', gap: 20 }}>
        <ChartCard title="Monthly Revenue & Bookings" locked={!isPro} lockMsg="Upgrade to Pro for revenue charts">
          {earningsChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={earningsChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                <Bar dataKey="bookings" name="Bookings" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No revenue data yet. Accept bookings to see charts!</p>
          )}
        </ChartCard>

        <ChartCard title="Booking Status" locked={!isPro}>
          {bookingStatusChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bookingStatusChart} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bookingStatusChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No bookings yet</p>
          )}
        </ChartCard>
      </div>

      {/* Top Listings */}
      <ChartCard title="Top-Performing Listings" locked={!isPro}>
        {topListings?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topListings.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title || 'Property'}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{l.bookingCount} bookings</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', flexShrink: 0 }}>₹{l.revenue?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No completed bookings yet</p>
        )}
      </ChartCard>
    </div>
  );
}

// ── TENANT ANALYTICS ──────────────────────────────────────────────────────────
function TenantAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await getTenantAnalytics();
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 100, background: 'var(--bg-muted)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  if (!data) return null;

  const { summary, statusDistribution, spendingChart } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>My Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={<DollarSign size={22} />} label="Total Spent" value={`₹${summary.totalSpent.toLocaleString('en-IN')}`} color="#6366f1" />
        <StatCard icon={<Calendar size={22} />} label="Total Bookings" value={summary.totalBookings} color="#22d3ee" />
        <StatCard icon={<Home size={22} />} label="Saved Listings" value={summary.savedListings} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <ChartCard title="Monthly Spending">
          {spendingChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={spendingChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="spent" name="Spent (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No spending data yet</p>
          )}
        </ChartCard>

        <ChartCard title="Booking Status">
          {statusDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name">
                  {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No bookings yet</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [planId, setPlanId] = useState('free');

  useEffect(() => {
    import('../../api/subscriptionsApi').then(({ getMySubscription }) =>
      getMySubscription().then(({ data }) => setPlanId(data.data?.subscription?.planId || 'free')).catch(() => { })
    );
  }, []);

  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease' }}>
      {isOwner
        ? <OwnerAnalyticsDashboard planId={planId} />
        : <TenantAnalyticsDashboard />}

      <style>{`
        @keyframes fadeInUp { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
