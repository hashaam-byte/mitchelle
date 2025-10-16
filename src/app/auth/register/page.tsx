// app/(auth)/auth/register/page.tsx - WITH ROLE SELECTION
'use client'
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, AlertCircle, CheckCircle, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserRole = 'CLIENT' | 'ADMIN';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if admin account exists on mount
  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      setAdminExists(data.exists);
      setCheckingAdmin(false);
    } catch (error) {
      console.error('Error checking admin:', error);
      setCheckingAdmin(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName || formData.fullName.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      setError('Password must be at least 8 characters with 1 uppercase and 1 number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (selectedRole === 'ADMIN' && adminExists) {
      setError('Admin account already exists. Only one admin allowed.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Register user
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          role: selectedRole
        }),
      });

      const data = await registerRes.json();

      if (!registerRes.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Show success message briefly
      setSuccess(true);
      
      // Auto-login after successful registration
      setTimeout(async () => {
        const loginResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginResult?.ok) {
          // Force hard refresh to trigger middleware
          // Middleware will redirect to correct dashboard based on role
          window.location.href = selectedRole === 'ADMIN' ? '/admin/dashboard' : '/client/home';
        } else {
          // If auto-login fails, redirect to login page
          router.push('/auth/login');
        }
      }, 1500);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">Redirecting you to your dashboard...</p>
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2 cursor-pointer" onClick={() => router.push('/')}>
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
              MsCakeHub
            </h1>
          </div>
          <p className="text-gray-600 text-sm">Create your sweet account</p>
        </div>

        <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
            <p className="text-gray-600 text-sm">Join us for delicious treats</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Account Type</label>
              {checkingAdmin ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Client Role */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CLIENT')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedRole === 'CLIENT'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 bg-white/50 hover:border-pink-300'
                    }`}
                  >
                    <Users className={`w-8 h-8 mx-auto mb-2 ${
                      selectedRole === 'CLIENT' ? 'text-pink-600' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium text-sm ${
                      selectedRole === 'CLIENT' ? 'text-pink-700' : 'text-gray-600'
                    }`}>
                      Client
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Browse & order cakes</p>
                  </button>

                  {/* Admin Role */}
                  <button
                    type="button"
                    onClick={() => !adminExists && setSelectedRole('ADMIN')}
                    disabled={adminExists}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      selectedRole === 'ADMIN'
                        ? 'border-purple-500 bg-purple-50'
                        : adminExists
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                        : 'border-gray-200 bg-white/50 hover:border-purple-300'
                    }`}
                  >
                    <Shield className={`w-8 h-8 mx-auto mb-2 ${
                      selectedRole === 'ADMIN' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium text-sm ${
                      selectedRole === 'ADMIN' ? 'text-purple-700' : 'text-gray-600'
                    }`}>
                      Admin
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Manage the store</p>
                    {adminExists && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-xl">
                        <span className="text-xs font-semibold text-red-600 bg-white px-2 py-1 rounded">
                          Taken
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              )}
              
              {adminExists && selectedRole === 'ADMIN' && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  ⚠️ Admin account already exists. Contact the existing admin or choose Client role.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+234 123 456 7890"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Min 8 characters, 1 uppercase, 1 number</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (selectedRole === 'ADMIN' && adminExists)}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create {selectedRole === 'ADMIN' ? 'Admin' : 'Client'} Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}