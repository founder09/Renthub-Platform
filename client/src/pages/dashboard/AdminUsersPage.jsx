import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [unverifiedOwners, setUnverifiedOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const { data } = await api.get('/admin/unverified-owners');
      setUnverifiedOwners(data.owners);
    } catch (err) {
      toast.error('Failed to load unverified owners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/verify-owner/${id}`);
      toast.success('Owner verified successfully');
      setUnverifiedOwners(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      toast.error('Failed to verify owner');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this owner account?')) return;
    try {
      await api.delete(`/admin/reject-owner/${id}`);
      toast.success('Owner rejected successfully');
      setUnverifiedOwners(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      toast.error('Failed to reject owner');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="text-indigo-600" /> Verify Owners
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve owner accounts so they can create listings.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {unverifiedOwners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No unverified owners pending.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Proof Document</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {unverifiedOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{owner.username}</td>
                    <td className="px-6 py-4 text-slate-500">{owner.email}</td>
                    <td className="px-6 py-4">
                      {owner.ownerProof ? (
                        <a href={owner.ownerProof} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          View Document
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No document</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerify(owner._id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleReject(owner._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
