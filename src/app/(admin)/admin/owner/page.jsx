'use client'
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Eye, Plus, Trash2, Users, ShoppingBag, X, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adFormData, setAdFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    startDate: '',
    endDate: '',
    revenuePerView: '0.10'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchAds();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/owner/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'ml_default');

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
        {
          method: 'POST',
          body: uploadData
        }
      );
      const data = await res.json();
      setAdFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAd = async () => {
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adFormData)
      });

      if (res.ok) {
        fetchAds();
        fetchDashboard();
        setShowAdModal(false);
        setAdFormData({
          title: '',
          imageUrl: '',
          link: '',
          startDate: '',
          endDate: '',
          revenuePerView: '0.10'
        });
      }
    } catch (error) {
      console.error('Failed to create ad:', error);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const res = await fetch(`/api/ads/${adId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAds();
        fetchDashboard();
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const COLORS = ['#ec4899', '#f472b6', '#fb7185', '#f97316'];

  const revenueData = [
    { name: 'Commission (5%)', value: stats?.totalCommission || 0 },
    { name: 'Ad Revenue', value: stats?.totalAdRevenue || 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="backdrop-blur-lg bg-white/70 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                Platform Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor your platform revenue and performance</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium">
              Super Admin
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Commission (5%)</p>
                <p className="text-2xl font-bold text-gray-800">₦{stats?.totalCommission?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ad Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₦{stats?.totalAdRevenue?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Platform Sales</p>
                <p className="text-2xl font-bold text-gray-800">₦{stats?.totalSales?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Active Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.dailyActiveUsers || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Breakdown</h2>
            {revenueData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No revenue data yet
              </div>
            )}
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Platform Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-pink-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-gray-800">{stats?.ordersPlaced || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">New Users Today</p>
                    <p className="text-xl font-bold text-gray-800">{stats?.newUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ad Impressions Today</p>
                    <p className="text-xl font-bold text-gray-800">{stats?.adImpressions || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Ad Management</h2>
            <button
              onClick={() => setShowAdModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Ad
            </button>
          </div>

          {ads.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No ads yet</h3>
              <p className="text-gray-600 mb-6">Create your first ad to start earning impression revenue</p>
              <button
                onClick={() => setShowAdModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium"
              >
                Create Ad
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white/50 rounded-xl p-4 border border-pink-100">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h3 className="font-bold text-gray-800 mb-1">{ad.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>Impressions:</span>
                      <span className="font-medium text-gray-800">{ad.impressions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium text-green-600">₦{ad.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${ad.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-lg bg-white/90 rounded-3xl border border-white/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create New Ad</h2>
              <button
                onClick={() => {
                  setShowAdModal(false);
                  setAdFormData({
                    title: '',
                    imageUrl: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    revenuePerView: '0.10'
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Image</label>
                {adFormData.imageUrl ? (
                  <div className="relative">
                    <img src={adFormData.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      onClick={() => setAdFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload ad image</p>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title</label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Special Valentine Offer"
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                <input
                  type="url"
                  value={adFormData.link}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={adFormData.startDate}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={adFormData.endDate}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenue per View (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={adFormData.revenuePerView}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, revenuePerView: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">Default: ₦0.10 per impression</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAd}
                  disabled={!adFormData.title || !adFormData.imageUrl || !adFormData.startDate || !adFormData.endDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  Create Ad
                </button>
                <button
                  onClick={() => {
                    setShowAdModal(false);
                    setAdFormData({
                      title: '',
                      imageUrl: '',
                      link: '',
                      startDate: '',
                      endDate: '',
                      revenuePerView: '0.10'
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}