import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notificationsApi';
import toast from 'react-hot-toast';
import { CheckCheck, Trash2, Bell, RefreshCw } from 'lucide-react';

const TYPE_ICONS = {
  BOOKING_SUBMITTED:         '📩',
  BOOKING_ACCEPTED:          '✅',
  BOOKING_REJECTED:          '❌',
  PAYMENT_SUCCESS:           '💰',
  BOOKING_CANCELLED:         '🚫',
  NEW_BOOKING_REQUEST:       '🔔',
  PAYMENT_RECEIVED:          '💵',
  BOOKING_CANCELLED_BY_TENANT: '🚫',
  SYSTEM_ALERT:              '⚠️',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [unread,   setUnread]   = useState(0);
  const LIMIT = 20;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications({ page, limit: LIMIT });
      setNotifs(data.data.notifications);
      setTotal(data.data.total);
      setUnread(data.data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page]);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifs(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifs(p => p.map(n => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      const removed = notifs.find(n => n._id === id);
      await deleteNotification(id);
      setNotifs(p => p.filter(n => n._id !== id));
      setTotal(t => t - 1);
      if (removed && !removed.isRead) setUnread(u => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={24} /> Notifications
            {unread > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>{unread} new</span>
            )}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Stay updated with your booking activity</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && (
            <button onClick={handleMarkAll}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button onClick={fetch}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--bg-muted)', border: '1px solid var(--border-default)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading notifications…</div>
        ) : notifs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>All caught up!</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>No notifications yet.</p>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div key={n._id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px',
                borderBottom: i < notifs.length - 1 ? '1px solid var(--border-default)' : 'none',
                background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
              }}
              onClick={() => !n.isRead && handleRead(n._id)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)'}
            >
              {!n.isRead && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#6366f1', borderRadius: '4px 0 0 4px' }} />
              )}
              <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '📢'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                {n.actionUrl && (
                  <a href={n.actionUrl} style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                    View Details →
                  </a>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: 6, borderRadius: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

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
        .fade-in-up { animation: fadeInUp 0.3s ease; }
        @keyframes fadeInUp { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  );
}
