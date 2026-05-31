import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../services/api';

const ForgotPassword = () => {
  const { isDark, toggleDarkMode } = useThemeStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f1] to-[#e2e4e7] dark:from-[#1e1e1e] dark:to-[#1e1e1e] px-4 relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-[#252526] border border-[#e2e4e7] dark:border-[#3c3c3c] shadow-sm hover:shadow-md transition-all cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} className="text-[#cccccc]" /> : <Moon size={18} className="text-[#50575e]" />}
        </button>
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-[#46b450] dark:bg-[#6a9955] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-[#cccccc] mb-2">Check Your Email</h1>
          <div className="bg-white dark:bg-[#252526] rounded shadow-md p-6">
            <p className="text-sm text-[#50575e] dark:text-[#969696]">
              A password reset link has been sent to{' '}
              <strong className="text-[#1d2327] dark:text-[#cccccc]">{email}</strong>
            </p>
            <p className="text-xs text-[#646970] dark:text-[#6e6e6e] mt-3">
              If you don&apos;t see it, check your spam folder. The link expires in 1 hour.
            </p>
          </div>
          <div className="mt-6">
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
  }

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
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-[#cccccc]">Forgot Password?</h1>
          <p className="text-sm text-[#646970] dark:text-[#969696] mt-1">
            Enter your email to receive a reset link
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
                htmlFor="forgot_email"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="forgot_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2271B1] dark:bg-[#0e639c] hover:bg-[#135e96] dark:hover:bg-[#1177bb] disabled:bg-[#2271B1]/50 dark:disabled:bg-[#0e639c]/50 text-white font-medium rounded transition-colors duration-150 cursor-pointer"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
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

export default ForgotPassword;
