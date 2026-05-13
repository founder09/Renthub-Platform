import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getOwnerBookings, cancelBooking, acceptBooking, rejectBooking } from '../../api/bookingsApi';
import { createOrder, verifyPayment } from '../../api/paymentsApi';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, Users, CreditCard, CheckCircle,
  XCircle, Clock, Ban, ChevronRight, Loader2, DollarSign, RefreshCw
} from 'lucide-react';

const STATUS_STYLES = {
  pending: { bg: '#fef9c3', color: '#92400e', dot: '#eab308' },
  accepted: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  cancelled: { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
  completed: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
};

const PAYMENT_STYLES = {
  unpaid: { bg: '#fff7ed', color: '#c2410c' },
  paid: { bg: '#dcfce7', color: '#166534' },
  refunded: { bg: '#ede9fe', color: '#7c3aed' },
};

function StatusBadge({ status, type = 'booking' }) {
  const styles = type === 'payment' ? PAYMENT_STYLES : STATUS_STYLES;
  const s = styles[status] || {};
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function BookingCard({ booking, isOwner, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const property = booking.propertyId;

  const imgSrc = property?.image?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70';

  const handleAccept = async () => {
    if (!confirm('Accept this booking?')) return;
    setLoading(true);
    try {
      await acceptBooking(booking._id);
      toast.success('Booking accepted!');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    const note = prompt('Reason for rejection (optional):');
    if (note === null) return; // cancelled
    setLoading(true);
    try {
      await rejectBooking(booking._id, { note });
      toast.success('Booking rejected');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    setLoading(true);
    try {
      await cancelBooking(booking._id);
      toast.success('Booking cancelled');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handlePay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Payment gateway unavailable'); return; }
    setLoading(true);
    try {
      const { data } = await createOrder(booking._id);
      const opts = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'RentHub',
        description: `Booking ${booking.bookingId}`,
        order_id: data.data.orderId,
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            });
            toast.success('Payment successful! ✅');
            onRefresh();
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(opts).open();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); setLoading(false); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
    >
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Image */}
        <div style={{ width: 120, minHeight: 120, flexShrink: 0, background: '#f1f5f9', overflow: 'hidden' }}>
          <img src={imgSrc} alt={property?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70'} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{property?.title || 'Property'}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {property?.location}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <StatusBadge status={booking.bookingStatus} />
              <StatusBadge status={booking.paymentStatus} type="payment" />
            </div>
          </div>

          {/* Dates & guests */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {fmtDate(booking.checkInDate)} – {fmtDate(booking.checkOutDate)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
          </div>

          {/* Who booked (for owner view) */}
          {isOwner && booking.tenantId && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Tenant: <strong style={{ color: 'var(--text-primary)' }}>{booking.tenantId.username}</strong>
              {booking.tenantId.email && ` · ${booking.tenantId.email}`}
            </p>
          )}

          {/* Booking ID */}
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>ID: {booking.bookingId}</p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {/* Owner: pending → accept/reject */}
            {isOwner && booking.bookingStatus === 'pending' && (
              <>
                <button onClick={handleAccept} disabled={loading} style={{ padding: '6px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />} Accept
                </button>
                <button onClick={handleReject} disabled={loading} style={{ padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}

            {/* Tenant: accepted + unpaid → pay */}
            {!isOwner && booking.bookingStatus === 'accepted' && booking.paymentStatus === 'unpaid' && (
              <button onClick={handlePay} disabled={loading} style={{ padding: '6px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? <Loader2 size={14} className="spin" /> : <CreditCard size={14} />} Pay Now
              </button>
            )}

            {/* Cancel option */}
            {['pending', 'accepted'].includes(booking.bookingStatus) && (
              <button onClick={handleCancel} disabled={loading} style={{ padding: '6px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ban size={14} /> Cancel
              </button>
            )}

            {/* Rejection note */}
            {booking.bookingStatus === 'rejected' && booking.rejectionNote && (
              <p style={{ margin: 0, fontSize: 12, color: '#b91c1c', padding: '6px 12px', background: '#fee2e2', borderRadius: 8 }}>
                Reason: {booking.rejectionNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
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

const FILTER_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
];

export default function BookingsDashboard() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const fn = isOwner ? getOwnerBookings : getMyBookings;
      const { data } = await fn({ status: filter || undefined, page, limit: LIMIT });
      setBookings(data.data.bookings);
      setTotal(data.data.total);
    } catch (e) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter, page]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    accepted: bookings.filter(b => b.bookingStatus === 'accepted').length,
    earnings: bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0),
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {isOwner ? 'Booking Requests' : 'My Bookings'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            {isOwner ? 'Manage incoming reservation requests' : 'Track your accommodation bookings'}
          </p>
        </div>
        <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-muted)', border: '1px solid var(--border-default)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Bookings', value: total, icon: '📋' },
          { label: 'Pending', value: stats.pending, icon: '⏳' },
          { label: 'Accepted', value: stats.accepted, icon: '✅' },
          {
            label: isOwner ? 'Revenue (paid)' : 'Amount Paid',
            value: `₹${stats.earnings.toLocaleString('en-IN')}`, icon: '💰'
          },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 14, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.value} onClick={() => { setFilter(tab.value); setPage(1); }}
            style={{
              padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid',
              borderColor: filter === tab.value ? '#6366f1' : 'var(--border-default)',
              background: filter === tab.value ? '#6366f1' : 'transparent',
              color: filter === tab.value ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 120, background: 'var(--bg-muted)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No bookings found</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
            {filter ? `No ${filter} bookings yet.` : 'No bookings here yet.'}
          </p>
          {!isOwner && (
            <a href="/listings" style={{ display: 'inline-block', marginTop: 16, padding: '8px 20px', background: '#6366f1', color: '#fff', borderRadius: 10, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              Browse Listings
            </a>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <BookingCard key={b._id} booking={b} isOwner={isOwner} onRefresh={fetchBookings} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}
            style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'transparent', cursor: page >= Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(total / LIMIT) ? 0.4 : 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Next →
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in-up { animation: fadeInUp 0.3s ease; }
        @keyframes fadeInUp { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  );
}
