import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, toggleDarkMode } = useThemeStore();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Invalid or missing reset token');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      navigate('/login?reset=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f1] to-[#e2e4e7] dark:from-[#1e1e1e] dark:to-[#1e1e1e] px-4 relative">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-[#252526] border border-[#e2e4e7] dark:border-[#3c3c3c] shadow-sm hover:shadow-md transition-all cursor-pointer"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={18} className="text-[#cccccc]" /> : <Moon size={18} className="text-[#50575e]" />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#2271B1] dark:bg-[#0e639c] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white text-4xl font-bold tracking-tight">S</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-[#cccccc]">Reset Password</h1>
          <p className="text-sm text-[#646970] dark:text-[#969696] mt-1">
            Choose a new password for your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#252526] rounded shadow-md overflow-hidden"
        >
          {error && (
            <div
              role="alert"
              className="mx-6 mt-4 px-4 py-3 bg-white dark:bg-[#252526] border-l-4 border-[#d63638] dark:border-[#f44747] text-[#d63638] dark:text-[#f44747] text-sm"
            >
              {error}
            </div>
          )}

          <div className="p-6 space-y-5">
            <div>
              <label
                htmlFor="reset_pass"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset_pass"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8f94] dark:text-[#969696] hover:text-[#50575e] dark:hover:text-[#cccccc] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="reset_pass_confirm"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="reset_pass_confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2.5 px-4 bg-[#2271B1] dark:bg-[#0e639c] hover:bg-[#135e96] dark:hover:bg-[#1177bb] disabled:bg-[#2271B1]/50 dark:disabled:bg-[#0e639c]/50 text-white font-medium rounded transition-colors duration-150 cursor-pointer"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-[#2271B1] dark:text-[#4fc1ff] hover:text-[#135e96] dark:hover:text-[#75beff] transition-colors"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
