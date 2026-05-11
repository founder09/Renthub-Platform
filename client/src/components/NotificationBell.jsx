import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../api/notificationsApi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
  const mins  = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [notifs,   setNotifs]   = useState([]);
  const [unread,   setUnread]   = useState(0);
  const [loading,  setLoading]  = useState(false);
  const dropRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread count every 30s when logged in
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const { data } = await getUnreadCount();
        setUnread(data.data.count);
      } catch { /* silently ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await getNotifications({ limit: 15 });
      setNotifs(data.data.notifications);
      setUnread(data.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(o => !o);
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const removed = notifs.find(n => n._id === id);
      setNotifs(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.isRead) setUnread(u => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  if (!user) return null;

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={toggleOpen}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-surface)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 360, maxHeight: 480,
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          zIndex: 9998, overflow: 'hidden',
          animation: 'fadeDown 0.15s ease',
        }}>
          {/* Dropdown header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 16px 12px', borderBottom: '1px solid var(--border-default)',
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications {unread > 0 && <span style={{ color: '#6366f1' }}>({unread})</span>}
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {unread > 0 && (
                <button onClick={handleMarkAllRead} title="Mark all as read"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCheck size={14} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div style={{ overflowY: 'auto', maxHeight: 360 }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>Loading…</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔕</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div key={n._id}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                    borderBottom: '1px solid var(--border-default)',
                    background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)'}
                >
                  <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '📢'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {n.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {n.message}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: 4, borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  {!n.isRead && (
                    <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer link */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-default)', textAlign: 'center' }}>
            <Link to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
