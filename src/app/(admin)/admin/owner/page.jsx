'use client'
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Eye, Plus, Trash2, Users, ShoppingBag, X, Calendar, Percent, ArrowUpRight, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import CloudinaryUpload from '@/app/components/CloudinaryUpload';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adFormData, setAdFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    startDate: '',
    endDate: '',
    revenuePerView: '0.50',
    position: 'BOTTOM_RIGHT',
    type: 'BANNER'
  });

  useEffect(() => {
    fetchDashboard();
    fetchAds();
    fetchRevenueHistory();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
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

  const fetchRevenueHistory = async () => {
    try {
      const res = await fetch('/api/owner/revenue-history');
      const data = await res.json();
      setRevenueHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch revenue history:', error);
    }
  };

  const handleCreateAd = async () => {
    if (!adFormData.title || !adFormData.imageUrl || !adFormData.startDate || !adFormData.endDate) {
      alert('Please fill all required fields');
      return;
    }

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
          revenuePerView: '0.50',
          position: 'BOTTOM_RIGHT',
          type: 'BANNER'
        });
        alert('Ad created successfully! It will now appear to all users.');
      }
    } catch (error) {
      console.error('Failed to create ad:', error);
      alert('Failed to create ad');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad? All impression data will be lost.')) return;

    try {
      const res = await fetch(`/api/ads/${adId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAds();
        fetchDashboard();
        alert('Ad deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const COLORS = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];

  const revenueBreakdown = [
    { name: 'Sales Commission (5%)', value: stats?.totalCommission || 0, color: '#ec4899' },
    { name: 'Ad Impressions', value: stats?.totalAdRevenue || 0, color: '#8b5cf6' }
  ];

  const totalRevenue = (stats?.totalCommission || 0) + (stats?.totalAdRevenue || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Platform Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time revenue tracking • Auto-commission calculation • Ad monetization</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg">
                💎 Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Revenue Card */}
        <div className="mb-8 backdrop-blur-xl bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-2">💰 TOTAL PLATFORM REVENUE</p>
                <h2 className="text-5xl font-bold mb-2">₦{totalRevenue.toLocaleString()}</h2>
                <p className="text-pink-100 text-sm">Auto-calculated from 5% commission + Ad revenue</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
                <TrendingUp className="w-12 h-12" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-pink-100 text-xs mb-1">Sales Commission</p>
                <p className="text-2xl font-bold">₦{stats?.totalCommission?.toLocaleString() || '0'}</p>
                <p className="text-pink-100 text-xs mt-1">5% of all sales</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-pink-100 text-xs mb-1">Ad Revenue</p>
                <p className="text-2xl font-bold">₦{stats?.totalAdRevenue?.toLocaleString() || '0'}</p>
                <p className="text-pink-100 text-xs mt-1">{stats?.adImpressions || 0} impressions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <p className="text-pink-100 text-xs mb-1">Platform Sales</p>
                <p className="text-2xl font-bold">₦{stats?.totalSales?.toLocaleString() || '0'}</p>
                <p className="text-pink-100 text-xs mt-1">Total volume</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Commission</p>
                <p className="text-2xl font-bold text-gray-800">₦{((stats?.totalCommission || 0) / 30).toFixed(0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-2 py-1 w-fit">
              <ArrowUpRight className="w-3 h-3" />
              <span>5% per sale</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Ad Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₦{((stats?.adImpressions || 0) * 0.5).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 rounded-lg px-2 py-1 w-fit">
              <Zap className="w-3 h-3" />
              <span>{stats?.adImpressions || 0} impressions</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users Today</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.dailyActiveUsers || '0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1 w-fit">
              <Users className="w-3 h-3" />
              <span>{stats?.newUsers || 0} new</span>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders Today</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.ordersPlaced || '0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1 w-fit">
              <Target className="w-3 h-3" />
              <span>Platform wide</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown Pie */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-pink-600" />
              Revenue Sources
            </h2>
            {totalRevenue > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <DollarSign className="w-16 h-16 mb-4 text-gray-300" />
                <p className="font-medium">No revenue data yet</p>
                <p className="text-sm mt-2">Revenue will appear as payments are processed</p>
              </div>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              7-Day Revenue Trend
            </h2>
            {revenueHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => `₦${Number(value).toLocaleString()}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="commission" stroke="#ec4899" strokeWidth={2} name="Commission" />
                  <Line type="monotone" dataKey="adRevenue" stroke="#8b5cf6" strokeWidth={2} name="Ad Revenue" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-16 h-16 mb-4 text-gray-300" />
                <p className="font-medium">Building revenue history</p>
                <p className="text-sm mt-2">Data will appear after first transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Ad Management */}
        <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Ad Campaign Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">Create ads that appear to all users • Auto-tracked impressions • Instant revenue</p>
            </div>
            <button
              onClick={() => setShowAdModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Ad
            </button>
          </div>

          {ads.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
              <Eye className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No active ads</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first ad campaign to start earning impression revenue. Ads appear elegantly to all users without disrupting their experience.</p>
              <button
                onClick={() => setShowAdModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Ad
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-gradient-to-br from-white to-pink-50 rounded-2xl p-5 border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-xl group">
                  <div className="relative mb-4">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-40 object-cover rounded-xl shadow-md" />
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${ad.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {ad.isActive ? '🟢 LIVE' : '⚫ Inactive'}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">{ad.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-600">👁️ Impressions:</span>
                      <span className="font-bold text-purple-600">{ad.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">💰 Revenue:</span>
                      <span className="font-bold text-green-600">₦{ad.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">📍 Position:</span>
                      <span className="font-medium text-blue-600 text-xs">{ad.position.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 space-y-1 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium">{new Date(ad.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span className="font-medium">{new Date(ad.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per View:</span>
                      <span className="font-medium text-green-600">₦{ad.revenuePerView}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAd(ad.id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl font-medium hover:from-red-100 hover:to-red-200 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Campaign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-pink-100 text-sm mb-2">💳 Commission Rate</p>
            <p className="text-4xl font-bold mb-1">5%</p>
            <p className="text-pink-100 text-sm">From every successful payment</p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-purple-100 text-sm mb-2">📊 Ad Performance</p>
            <p className="text-4xl font-bold mb-1">₦0.50</p>
            <p className="text-purple-100 text-sm">Revenue per impression (default)</p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <p className="text-blue-100 text-sm mb-2">🎯 Active Campaigns</p>
            <p className="text-4xl font-bold mb-1">{ads.filter(ad => ad.isActive).length}</p>
            <p className="text-blue-100 text-sm">Currently running ads</p>
          </div>
        </div>
      </div>

      {/* Create Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/50 shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Create Ad Campaign</h2>
                <p className="text-gray-600 text-sm mt-1">Design and launch your ad • Auto-tracked revenue</p>
              </div>
              <button
                onClick={() => {
                  setShowAdModal(false);
                  setAdFormData({
                    title: '',
                    imageUrl: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    revenuePerView: '0.50',
                    position: 'BOTTOM_RIGHT',
                    type: 'BANNER'
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Ad Image *</label>
                <CloudinaryUpload
                  onUploadComplete={(url) => setAdFormData(prev => ({ ...prev, imageUrl: url }))}
                  currentImage={adFormData.imageUrl}
                  onRemove={() => setAdFormData(prev => ({ ...prev, imageUrl: '' }))}
                  folder="ads"
                />
                <p className="text-xs text-gray-500 mt-2">💡 Recommended: 1200x400px for banners, 400x400px for popups</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title *</label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Valentine's Special Offer"
                  className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Click-through URL (Optional)</label>
                <input
                  type="url"
                  value={adFormData.link}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://example.com/offer"
                  className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Position & Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ad Position *</label>
                  <select
                    value={adFormData.position}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="BOTTOM_RIGHT">Bottom Right (Non-intrusive)</option>
                    <option value="BOTTOM_LEFT">Bottom Left</option>
                    <option value="TOP_RIGHT">Top Right</option>
                    <option value="CENTER">Center (Modal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ad Type *</label>
                  <select
                    value={adFormData.type}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="BANNER">Banner (Sticky)</option>
                    <option value="POPUP">Popup (Dismissible)</option>
                    <option value="SIDEBAR">Sidebar</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Start Date *</label>
                  <input
                    type="date"
                    value={adFormData.startDate}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Campaign End Date *</label>
                  <input
                    type="date"
                    value={adFormData.endDate}
                    onChange={(e) => setAdFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Revenue per view */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Revenue per Impression (₦) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={adFormData.revenuePerView}
                  onChange={(e) => setAdFormData(prev => ({ ...prev, revenuePerView: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-2 bg-purple-50 p-3 rounded-lg">
                  💡 <strong>How it works:</strong> Every time a user sees this ad, you earn this amount automatically. Default is ₦0.50 per view.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAd}
                  disabled={!adFormData.title || !adFormData.imageUrl || !adFormData.startDate || !adFormData.endDate}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  🚀 Launch Ad Campaign
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
                      revenuePerView: '0.50',
                      position: 'BOTTOM_RIGHT',
                      type: 'BANNER'
                    });
                  }}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border-2 border-pink-100">
                <p className="text-sm text-gray-700">
                  <strong>📌 Important:</strong> Ads will appear elegantly to all users based on the position you select. Users can dismiss them, but each view counts as revenue. Ads are auto-tracked and revenue is calculated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}