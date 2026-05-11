import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../api/aiApi';
import ListingCard from './ListingCard';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function AIRecommendations({ budget, location, amenities, college, savedIds, onToggleSave }) {
  const [recs,    setRecs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRecommendations({ budget, location, amenities, college, limit: 4 })
      .then(({ data }) => { if (!cancelled) setRecs(data.data || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [budget, location, college]);

  if (!loading && recs.length === 0) return null;

  return (
    <section style={{ margin: '40px 0 0' }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>AI Recommendations</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Personalized matches powered by RentHub AI</p>
          </div>
        </div>
        <Link to="/listings" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
          View all <ChevronRight size={14} />
        </Link>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 260, background: 'var(--border-default)', borderRadius: 16, animation: 'shimmer 1.6s ease-in-out infinite' }} className="skeleton" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {recs.map((listing, i) => (
            <div key={listing._id} style={{ animation: 'fadeInUp 0.4s ease', animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
              <ListingCard listing={listing} savedIds={savedIds} onToggleSave={onToggleSave} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
