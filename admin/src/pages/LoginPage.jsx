import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import adminConfig from '../config/adminConfig';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (adminApi.isAdmin()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the admin password.");
      return;
    }

    const success = adminApi.login(password);
    if (success) {
      setError('');
      navigate('/dashboard');
    } else {
      setError("Invalid password. Please enter the correct admin password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Top Banner / Logo */}
      <div className="flex flex-col items-center mb-6 text-center">
        <img
          src="/images/college_logo.png"
          alt="College Logo"
          className="w-20 h-auto mb-3 rounded-lg shadow-lg bg-white p-1"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 drop-shadow-sm">
          {adminConfig.COLLEGE_NAME}
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mt-1">
          {adminConfig.PROGRAM_NAME}
        </h2>
        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-700" /> Administrative Portal
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/40">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Admin Authentication</h3>
          <p className="text-sm text-gray-500 mt-1">Enter your admin security password to access the panel</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Login to Admin Panel</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
          Secured Portal • Thiagarajar College of Engineering
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
