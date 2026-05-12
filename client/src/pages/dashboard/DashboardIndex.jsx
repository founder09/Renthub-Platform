import { useAuth } from '../../context/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import TenantDashboard from './TenantDashboard';

export default function DashboardIndex() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  if (!user) return <div className="p-8 text-center text-slate-500">Please log in.</div>;

  if (user.role === 'owner') return <OwnerDashboard />;
  if (user.role === 'admin') return <OwnerDashboard />; // Admins see owner dashboard for now + extra tabs
  
  return <TenantDashboard />;
}
