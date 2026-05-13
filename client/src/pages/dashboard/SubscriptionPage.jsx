import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMySubscription, createSubscriptionOrder, verifySubscriptionPay } from '../../api/subscriptionsApi';
import toast from 'react-hot-toast';
import { Check, Zap, Building2, Sparkles, Crown, Shield, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

const PLAN_META = {
  free: {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    icon: <Shield size={22} />,
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
    badge: null,
    color: '#64748b',
    features: [
      '2 property listings',
      'Basic dashboard',
      'Limited analytics',
      'Standard booking management',
      'Community support',
    ],
    locked: [
      'Advanced analytics',
      'AI description generator',
      'Featured listings',
      'Priority support',
    ],
  },
  pro: {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    icon: <Zap size={22} />,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    badge: 'MOST POPULAR',
    color: '#6366f1',
    features: [
      'Unlimited property listings',
      'Advanced analytics & charts',
      'AI description generator',
      'Featured listing priority',
      'Advanced booking management',
      'Priority support',
    ],
    locked: [
      'Team management',
      'Enterprise reports',
    ],
  },
  business: {
    name: 'Business',
    price: '₹2,999',
    period: '/month',
    icon: <Building2 size={22} />,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    badge: 'ENTERPRISE',
    color: '#f59e0b',
    features: [
      'Everything in Pro',
      'Multi-property management',
      'Team & staff management',
      'Advanced AI insights',
      'Enterprise-level reports',
      'Dedicated account manager',
      'Custom integrations (coming soon)',
    ],
    locked: [],
  },
};

function loadRazorpay() {
  return new Promise((resolve) => {
    if (document.getElementById('rzp-sdk')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'rzp-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // planId being processed

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const { data } = await getMySubscription();
      setSub(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleUpgrade = async (planId) => {
    if (!user) { toast.error('Please login first'); return; }
    if (planId === 'free') { toast('You\'re already on the Free plan or downgrade from profile'); return; }

    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment gateway unavailable'); return; }

    setPaying(planId);
    try {
      const { data } = await createSubscriptionOrder(planId);
      const { order, plan, keyId } = data.data;

      const opts = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RentHub',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        prefill: { name: user.username, email: user.email },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await verifySubscriptionPay({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId,
            });
            toast.success(`🎉 Welcome to ${plan.name} plan!`);
            fetchSub();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setPaying(null) },
      };
      new window.Razorpay(opts).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaying(null);
    }
  };

  const currentPlan = sub?.subscription?.planId || 'free';
  const isActive = sub?.isActive !== false;

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          <Crown size={14} /> Subscription Plans
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Scale Your Property Business
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
          Choose the plan that fits your needs. Upgrade anytime, cancel anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      {!loading && sub && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
          border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '16px 24px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Crown size={18} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Current Plan</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {PLAN_META[currentPlan]?.name || 'Free'} Plan
                <span style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 99, background: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#166534' : '#991b1b', fontWeight: 600 }}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
              </p>
            </div>
          </div>
          {sub?.subscription?.endDate && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Renews: <strong style={{ color: 'var(--text-primary)' }}>
                {new Date(sub.subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </strong>
            </p>
          )}
          <button onClick={fetchSub} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
        {Object.entries(PLAN_META).map(([planId, plan]) => {
          const isCurrent = currentPlan === planId && isActive;
          const isPopular = plan.badge === 'MOST POPULAR';

          return (
            <div key={planId} style={{
              background: 'var(--bg-surface)', border: `2px solid ${isCurrent ? plan.color : isPopular ? 'rgba(99,102,241,0.3)' : 'var(--border-default)'}`,
              borderRadius: 20, overflow: 'hidden', position: 'relative',
              boxShadow: isPopular ? '0 8px 30px rgba(99,102,241,0.15)' : 'var(--shadow-sm)',
              transform: isPopular ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s',
            }}>
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  background: plan.gradient, color: '#fff', textAlign: 'center', padding: '6px', fontSize: 11, fontWeight: 800, letterSpacing: 1,
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div style={{ padding: '24px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    {plan.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-primary)' }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} /> {f}
                  </div>
                ))}
                {plan.locked.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-disabled)', textDecoration: 'line-through' }}>
                    <span style={{ width: 14, height: 14, flexShrink: 0 }}>✕</span> {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '0 24px 24px' }}>
                {isCurrent ? (
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 12, fontSize: 14, fontWeight: 600, color: plan.color }}>
                    ✓ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(planId)}
                    disabled={!!paying}
                    style={{
                      width: '100%', height: 46, background: planId === 'free' ? 'transparent' : plan.gradient,
                      color: planId === 'free' ? plan.color : '#fff',
                      border: planId === 'free' ? `2px solid ${plan.color}` : 'none',
                      borderRadius: 12, fontSize: 15, fontWeight: 700,
                      cursor: paying ? 'not-allowed' : 'pointer',
                      opacity: paying && paying !== planId ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {paying === planId ? (
                      <><Loader2 size={16} className="spin" /> Processing…</>
                    ) : planId === 'free' ? (
                      'Downgrade to Free'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Comparison Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, overflow: 'hidden', marginBottom: 40 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Feature Comparison</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }}>Feature</th>
                {['Free', 'Pro', 'Business'].map(p => (
                  <th key={p} style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Property Listings', '2', 'Unlimited', 'Unlimited'],
                ['Advanced Analytics', '✕', '✓', '✓'],
                ['AI Description Generator', '✕', '✓', '✓'],
                ['Featured Property Boost', '✕', '✓', '✓'],
                ['Priority Support', '✕', '✓', '✓'],
                ['Team Management', '✕', '✕', '✓'],
                ['Enterprise Reports', '✕', '✕', '✓'],
                ['AI Business Insights', '✕', '✕', '✓'],
              ].map(([feature, ...vals], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                  <td style={{ padding: '14px 24px', fontSize: 14, color: 'var(--text-primary)' }}>{feature}</td>
                  {vals.map((v, j) => (
                    <td key={j} style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14 }}>
                      {v === '✓' ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                        : v === '✕' ? <span style={{ color: '#e2e8f0' }}>—</span>
                          : <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
