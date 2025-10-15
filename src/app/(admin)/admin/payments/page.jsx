'use client'
import { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, TrendingUp } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Transaction ID', 'Customer', 'Amount', 'Admin Earning', 'Platform Fee', 'Status', 'Date'].join(','),
      ...payments.map(p => [
        p.transactionRef,
        p.user?.fullName || 'N/A',
        p.amount,
        p.adminEarning,
        p.feeCollected,
        p.status,
        new Date(p.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPayments = filterStatus === 'ALL' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="backdrop-blur-lg bg-white/70 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                Payments & Revenue
              </h1>
              <p className="text-gray-600 mt-1">Track all transactions and earnings</p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue (95%)</p>
                <p className="text-2xl font-bold text-gray-800">₦{stats?.totalAdminEarning?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful Payments</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.successCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform Fee (5%)</p>
                <p className="text-2xl font-bold text-gray-800">₦{stats?.totalPlatformFee?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                    : 'bg-white/50 text-gray-700 hover:bg-pink-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-white/50">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-pink-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-12 border border-white/50 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No payments found</h3>
            <p className="text-gray-600">Payment transactions will appear here</p>
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-50 border-b border-pink-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Your Earning (95%)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Platform Fee (5%)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-700">{payment.transactionRef}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{payment.user?.fullName}</p>
                          <p className="text-sm text-gray-500">{payment.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">₦{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">₦{payment.adminEarning.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-pink-600">₦{payment.feeCollected.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}