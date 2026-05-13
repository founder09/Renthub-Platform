import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookingsApi';
import { createOrder, verifyPayment } from '../api/paymentsApi';
import toast from 'react-hot-toast';
import { X, Calendar, Users, CreditCard, Shield, Loader2 } from 'lucide-react';

const STATUS_COLOR = {
  pending: { bg: '#fef9c3', text: '#92400e', label: 'Pending' },
  accepted: { bg: '#dcfce7', text: '#166534', label: 'Accepted' },
  rejected: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  cancelled: { bg: '#f3f4f6', text: '#374151', label: 'Cancelled' },
  completed: { bg: '#dbeafe', text: '#1e40af', label: 'Completed' },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('rzp-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'rzp-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingModal({ listing, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
  });
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success'
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = form.checkInDate && form.checkOutDate
    ? Math.ceil((new Date(form.checkOutDate) - new Date(form.checkInDate)) / msPerDay)
    : 0;
  const months = Math.max(1, Math.ceil(days / 30));
  const rent = listing.price * months;
  const total = rent + (listing.securityDeposit || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    if (days <= 0) { toast.error('Select valid dates'); return; }
    setLoading(true);
    try {
      const { data } = await createBooking({ propertyId: listing._id, ...form });
      setBooking(data.data);
      setStep('success');
      toast.success('Booking request submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Failed to load payment gateway'); return; }
    setLoading(true);
    try {
      const { data } = await createOrder(booking._id);
      const options = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'RentHub',
        description: `Booking: ${listing.title}`,
        order_id: data.data.orderId,
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.phone || '',
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            });
            toast.success('Payment successful! Booking confirmed ✅');
            onClose();
            navigate('/dashboard/bookings');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 20,
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {step === 'success' ? '🎉 Request Submitted!' : 'Book This Property'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{listing.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* STEP: FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Date pickers */}
              <div style={{ border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: '12px 16px', borderRight: '1px solid var(--border-default)' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>CHECK-IN</label>
                    <input type="date" min={today} value={form.checkInDate} required
                      onChange={e => setForm(p => ({ ...p, checkInDate: e.target.value }))}
                      style={{ border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                    />
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>CHECK-OUT</label>
                    <input type="date" min={form.checkInDate || today} value={form.checkOutDate} required
                      onChange={e => setForm(p => ({ ...p, checkOutDate: e.target.value }))}
                      style={{ border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-default)' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>GUESTS</label>
                  <input type="number" min={1} max={listing.maxGuests || 1} value={form.numberOfGuests} required
                    onChange={e => setForm(p => ({ ...p, numberOfGuests: Number(e.target.value) }))}
                    style={{ border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Price breakdown */}
              {days > 0 && (
                <div style={{ background: 'var(--bg-muted)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'var(--text-secondary)' }}>
                    <span>₹{listing.price?.toLocaleString('en-IN')} × {months} month{months > 1 ? 's' : ''}</span>
                    <span>₹{rent.toLocaleString('en-IN')}</span>
                  </div>
                  {listing.securityDeposit > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'var(--text-secondary)' }}>
                      <span>Security Deposit</span>
                      <span>₹{listing.securityDeposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-default)', paddingTop: 10, marginTop: 4 }}>
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-muted)', borderRadius: 10, padding: 12 }}>
                <Shield size={16} style={{ flexShrink: 0, marginTop: 1, color: '#6366f1' }} />
                <span>Payment is only collected after the owner accepts your request.</span>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', height: 48, background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading ? <><Loader2 size={18} className="spin" /> Submitting…</> : 'Request to Book'}
              </button>
            </form>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Your booking request has been sent to the owner. You'll be notified once they respond.
                </p>
              </div>

              <div style={{ background: 'var(--bg-muted)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Booking ID</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{booking?.bookingId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ background: '#fef9c3', color: '#92400e', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>Pending</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{booking?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{
                  flex: 1, height: 44, background: 'var(--bg-muted)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 15,
                }}>
                  Close
                </button>
                <button onClick={() => { onClose(); navigate('/dashboard/bookings'); }} style={{
                  flex: 1, height: 44, background: '#6366f1', color: '#fff',
                  border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 15,
                }}>
                  View Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
