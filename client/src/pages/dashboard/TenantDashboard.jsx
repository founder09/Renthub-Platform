import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile')
      .then(res => setSavedListings(res.data.data.savedListings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.username}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your student housing dashboard.</p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Bookings</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't booked any accommodations yet. Start browsing to find your perfect student housing.</p>
        <a href="/listings" className="btn-primary inline-flex">Browse Listings</a>
      </div>
      
      {/* Saved listings */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Saved Properties</h2>
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading saved properties...</p>
            ) : savedListings.length === 0 ? (
              <p className="text-sm text-slate-500">You haven't saved any properties yet.</p>
            ) : (
              savedListings.map(listing => (
                <a href={`/listings/${listing._id}`} key={listing._id} className="flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={listing.image?.url || listing.image?.[0]?.url || 'https://via.placeholder.com/150'} alt={listing.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{listing.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><MapPin size={12}/> {listing.location}</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2">₹{listing.price?.toLocaleString('en-IN')}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
