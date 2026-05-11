/**
 * SubscriptionBanner — shows upgrade prompt when user hits a plan limit.
 * Usage: <SubscriptionBanner feature="aiFeatures" />
 */
import { Crown, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const FEATURE_COPY = {
  aiFeatures:        { title: 'AI Features require Pro', desc: 'Unlock AI description generator, smart recommendations, and more.' },
  analyticsAccess:   { title: 'Advanced Analytics require Pro', desc: 'Get detailed revenue charts, booking trends, and performance insights.' },
  featuredListings:  { title: 'Featured Listings require Pro', desc: 'Boost your property to the top of search results.' },
  maxListings:       { title: 'Listing Limit Reached', desc: 'Free plan allows 2 listings. Upgrade for unlimited.' },
  default:           { title: 'Upgrade to unlock this feature', desc: 'Get more from RentHub with a premium subscription.' },
};

export default function UpgradeBanner({ feature = 'default', dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const copy = FEATURE_COPY[feature] || FEATURE_COPY.default;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid rgba(99,102,241,0.4)', borderRadius: 14, padding: '14px 20px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Crown size={20} style={{ color: '#fcd34d', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{copy.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#c7d2fe' }}>{copy.desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/dashboard/subscription" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
          background: '#6366f1', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 13,
          textDecoration: 'none',
        }}>
          <Zap size={13} /> Upgrade Now
        </Link>
        {dismissible && (
          <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
