'use client'
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(formData.password) },
    { text: 'Contains uppercase', met: /[A-Z]/.test(formData.password) }
  ];

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(r => r.met)) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Redirect to login
      window.location.href = '/auth/login?registered=true';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
              MsCakeHub
            </h1>
          </div>
          <p className="text-gray-600 text-sm">Join the sweetest community</p>
        </div>

        <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 text-sm">Start your sweet journey today</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gray-200'} transition-all`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-pink-400 to-pink-600' : 'bg-gray-200'} transition-all`}></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                >
                  <option value="CLIENT">Client (Customer)</option>
                  <option value="ADMIN">Admin (First Admin Only)</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.email || !formData.phone}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="space-y-5">
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 bg-pink-50/50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-300'} transition-colors`}>
                      {req.met && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-600'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading || formData.password !== formData.confirmPassword || !passwordRequirements.every(r => r.met)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
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