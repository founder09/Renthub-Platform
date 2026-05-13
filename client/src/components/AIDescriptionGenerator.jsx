import { useState } from 'react';
import { generateDescription } from '../api/aiApi';
import toast from 'react-hot-toast';
import { Sparkles, RefreshCw, Copy, Check, Loader2 } from 'lucide-react';

const LISTING_TYPES = ['Room', 'PG', 'Flat', 'Hostel', 'Studio', 'Villa'];
const SAMPLE_AMENITIES = ['WiFi', 'AC', 'Parking', 'Laundry', 'Gym', 'CCTV', 'Power Backup', 'Hot Water', 'Meals Included', 'Balcony'];

export default function AIDescriptionGenerator({ prefill = {}, onUse }) {
  const [form, setForm] = useState({
    title: prefill.title || '',
    listingType: prefill.listingType || 'Room',
    location: prefill.location || '',
    nearCollege: prefill.nearCollege || '',
    price: prefill.price || '',
    bedrooms: prefill.bedrooms || 1,
    bathrooms: prefill.bathrooms || 1,
    maxGuests: prefill.maxGuests || 1,
    gender: prefill.gender || 'Any',
    amenities: prefill.amenities || [],
    securityDeposit: prefill.securityDeposit || 0,
    country: 'India',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleAmenity = (a) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a],
    }));
  };

  const handleGenerate = async () => {
    if (!form.title) { toast.error('Enter a property title first'); return; }
    setLoading(true);
    try {
      const { data } = await generateDescription(form);
      setResult(data.data);
      toast.success(data.data.aiGenerated ? '✨ AI description generated!' : '📝 Description generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.description) return;
    navigator.clipboard.writeText(result.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const inputStyle = {
    width: '100%', height: 40, padding: '0 12px',
    background: 'var(--bg-subtle)', border: '1.5px solid var(--border-default)',
    borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AI Description Generator</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Generate professional, SEO-friendly property descriptions</p>
        </div>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Property Title *', key: 'title', type: 'text', placeholder: 'e.g. Cozy Room Near IIT Delhi' },
            { label: 'Location *', key: 'location', type: 'text', placeholder: 'e.g. Hauz Khas, Delhi' },
            { label: 'Near College', key: 'nearCollege', type: 'text', placeholder: 'e.g. IIT Delhi' },
            { label: 'Monthly Rent (₹)', key: 'price', type: 'number', placeholder: '8000' },
            { label: 'Bedrooms', key: 'bedrooms', type: 'number', placeholder: '1' },
            { label: 'Bathrooms', key: 'bathrooms', type: 'number', placeholder: '1' },
            { label: 'Max Guests', key: 'maxGuests', type: 'number', placeholder: '2' },
            { label: 'Security Deposit (₹)', key: 'securityDeposit', type: 'number', placeholder: '10000' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Property Type</label>
            <select value={form.listingType} onChange={e => setForm(p => ({ ...p, listingType: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {LISTING_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Gender Preference</label>
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['Any', 'Male', 'Female'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SAMPLE_AMENITIES.map(a => (
              <button key={a} onClick={() => toggleAmenity(a)} style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: '1.5px solid', transition: 'all 0.15s',
                borderColor: form.amenities.includes(a) ? '#6366f1' : 'var(--border-default)',
                background: form.amenities.includes(a) ? '#6366f1' : 'transparent',
                color: form.amenities.includes(a) ? '#fff' : 'var(--text-secondary)',
              }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={loading} style={{
          height: 46, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? <><Loader2 size={16} className="spin" /> Generating…</> : <><Sparkles size={16} /> Generate Description</>}
        </button>

        {/* Result */}
        {result && (
          <div style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border-default)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Generated Description</h4>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: result.aiGenerated ? 'rgba(99,102,241,0.1)' : 'var(--bg-muted)', color: result.aiGenerated ? '#6366f1' : 'var(--text-secondary)', fontWeight: 600 }}>
                  {result.aiGenerated ? '✨ AI' : '📝 Smart'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleGenerate} title="Regenerate" style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button onClick={handleCopy} title="Copy" style={{ background: 'none', border: '1px solid var(--border-default)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: copied ? '#10b981' : 'var(--text-secondary)' }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {result.description}
            </p>

            {onUse && (
              <button onClick={() => onUse(result.description)} style={{
                padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}>
                Use This Description
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
