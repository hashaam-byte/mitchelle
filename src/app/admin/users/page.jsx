'use client'
import { useState, useEffect } from 'react';
import { Users, Search, Award, Gift, X, TrendingUp } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegularStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegular: !currentStatus })
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const assignDiscount = async () => {
    if (!selectedUser || !discountValue) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalDiscount: parseFloat(discountValue) })
      });

      if (res.ok) {
        setShowDiscountModal(false);
        setSelectedUser(null);
        setDiscountValue('');
        alert('Discount assigned successfully!');
      }
    } catch (error) {
      console.error('Failed to assign discount:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="backdrop-blur-lg bg-white/70 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage customers and assign special privileges</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-white/50">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-pink-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-12 border border-white/50 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600">Users will appear here once they register</p>
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-50 border-b border-pink-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Total Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.fullName}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-gray-800">₦{user.totalSpent?.toLocaleString() || '0'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isRegular ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <Award className="w-3 h-3" />
                            Regular
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRegularStatus(user.id, user.isRegular)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              user.isRegular
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            {user.isRegular ? 'Remove Regular' : 'Mark Regular'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDiscountModal(true);
                            }}
                            className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors flex items-center gap-1"
                          >
                            <Gift className="w-4 h-4" />
                            Discount
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl border border-white/50 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Assign Discount</h2>
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setSelectedUser(null);
                  setDiscountValue('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Creating a personal discount for <span className="font-bold text-gray-800">{selectedUser?.fullName}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">This will create a unique discount code for this user</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={assignDiscount}
                disabled={!discountValue}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                Assign Discount
              </button>
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setSelectedUser(null);
                  setDiscountValue('');
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}