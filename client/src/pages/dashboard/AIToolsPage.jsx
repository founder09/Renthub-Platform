import { useState } from 'react';
import AIDescriptionGenerator from '../../components/AIDescriptionGenerator';
import { Sparkles, Target, ShieldAlert, MessageCircle } from 'lucide-react';

const TOOLS = [
  { id: 'description', label: 'AI Description Generator', icon: <Sparkles size={18} />, desc: 'Generate professional, SEO-friendly property descriptions in seconds.', badge: null },
  { id: 'recommendations', label: 'Smart Recommendations', icon: <Target size={18} />, desc: 'Find the best-matched properties for tenants using AI scoring.', badge: 'Tenant' },
  { id: 'fraud', label: 'Fraud Detection', icon: <ShieldAlert size={18} />, desc: 'Detect suspicious listings, duplicate posts, and fake accounts.', badge: 'Admin' },
  { id: 'chat', label: 'AI Chat Assistant', icon: <MessageCircle size={18} />, desc: 'Smart assistant to help users with bookings, search, and recommendations.', badge: 'Coming Soon' },
];

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState('description');

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', color: '#6366f1', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          <Sparkles size={14} /> AI-Powered Features
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>AI Tools</h1>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--text-secondary)' }}>
          Intelligent features powered by RentHub AI — setting us apart from every other rental platform.
        </p>
      </div>

      {/* Tool Nav */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {TOOLS.map(tool => (
          <button key={tool.id} onClick={() => setActiveTool(tool.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
              borderRadius: 12, border: '1.5px solid', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              transition: 'all 0.15s',
              borderColor: activeTool === tool.id ? '#6366f1' : 'var(--border-default)',
              background: activeTool === tool.id ? '#6366f1' : 'var(--bg-surface)',
              color: activeTool === tool.id ? '#fff' : 'var(--text-secondary)',
            }}>
            {tool.icon} {tool.label}
            {tool.badge && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: activeTool === tool.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)', color: activeTool === tool.id ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>
                {tool.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tool content */}
      {activeTool === 'description' && <AIDescriptionGenerator />}

      {activeTool === 'recommendations' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Smart Recommendations</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 15, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Our AI recommendation engine is active on the listings page. Search for a property and get smart personalized matches based on your budget, location, and preferences.
          </p>
          <a href="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#6366f1', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <Target size={16} /> Browse Smart Recommendations
          </a>
        </div>
      )}

      {activeTool === 'fraud' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Fraud Detection Engine</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 15, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Our rule-based fraud detection system automatically analyzes listings for suspicious pricing, duplicate posts, and incomplete information. Admin access required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Suspicious Price Detection', status: 'Active' },
              { label: 'Duplicate Listing Scanner', status: 'Active' },
              { label: 'Spam Account Detection', status: 'Coming Soon' },
              { label: 'ML-Based Fraud Score', status: 'Coming Soon' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px 20px', textAlign: 'left', minWidth: 200 }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</p>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: f.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: f.status === 'Active' ? '#166534' : 'var(--text-muted)', fontWeight: 600 }}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'chat' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>AI Chat Assistant</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 15, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Scalable chat architecture is ready. Full LLM integration via Google Gemini is one API key away. The backend chat endpoint is live at <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>/api/ai/chat</code>.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            🚧 Full UI coming in Phase 4 — Backend ready!
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInUp { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }`}</style>
    </div>
  );
}
