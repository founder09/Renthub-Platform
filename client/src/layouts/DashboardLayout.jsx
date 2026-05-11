import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, Bookmark, Settings,
  LogOut, Menu, X, Users, TrendingUp, BookOpen, Bell,
  Sparkles, Crown, BarChart2, Home
} from 'lucide-react';
import RentHubLogo from '../components/Logo';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation based on role
  const getNavLinks = () => {
    const role = user?.role || 'tenant';
    const links = [
      { to: '/dashboard',            label: 'Overview',        icon: <LayoutDashboard size={18} /> },
    ];

    if (role === 'owner' || role === 'admin') {
      links.push({ to: '/dashboard/properties', label: 'My Properties', icon: <Building2 size={18} /> });
    }
    if (role === 'admin') {
      links.push({ to: '/dashboard/users', label: 'All Users', icon: <Users size={18} /> });
    }
    if (role === 'tenant') {
      links.push({ to: '/dashboard/saved', label: 'Saved Listings', icon: <Bookmark size={18} /> });
    }

    // Visible to all roles
    links.push({ to: '/dashboard/bookings',      label: 'Bookings',       icon: <BookOpen size={18} /> });
    links.push({ to: '/dashboard/analytics',     label: 'Analytics',      icon: <BarChart2 size={18} /> });
    links.push({ to: '/dashboard/ai-tools',      label: 'AI Tools',       icon: <Sparkles size={18} />, badge: 'AI' });
    links.push({ to: '/dashboard/subscription',  label: 'Subscription',   icon: <Crown size={18} /> });
    links.push({ to: '/dashboard/notifications', label: 'Notifications',  icon: <Bell size={18} /> });
    links.push({ to: '/profile',                 label: 'Settings',       icon: <Settings size={18} /> });

    return links;
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#0f172a]">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 
        transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <RentHubLogo size={28} />
            <span className="text-xl font-bold text-slate-900 dark:text-white">RentHub</span>
          </Link>
          <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {link.icon}
                {link.label}
                {link.badge && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Topbar Mobile */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <RentHubLogo size={24} />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/listings" className="text-sm font-medium text-indigo-600 flex items-center gap-1">
              <Home size={16} /> Browse
            </Link>
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
