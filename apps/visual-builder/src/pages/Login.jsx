import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, toggleDarkMode } = useThemeStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setResetSuccess(true);
    }
  }, []);

  useEffect(() => {
    const isElectron = navigator.userAgent.includes('Electron');
    if (isElectron) {
      localStorage.setItem('sukit-auth-token', 'electron-local-token');
      navigate('/dashboard', { replace: true });
      return;
    }
    const token = localStorage.getItem('sukit-auth-token');
    if (token) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const savedEmail = localStorage.getItem('sukit-remembered-email');
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      if (rememberMe) {
        localStorage.setItem('sukit-remembered-email', form.email);
      } else {
        localStorage.removeItem('sukit-remembered-email');
      }
      navigate('/dashboard');
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
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-[#cccccc]">SuKit</h1>
          <p className="text-sm text-[#646970] dark:text-[#969696] mt-1">Visual Builder</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#252526] rounded shadow-md overflow-hidden"
        >
          {resetSuccess && (
            <div
              role="status"
              className="mx-6 mt-4 px-4 py-3 bg-white dark:bg-[#252526] border-l-4 border-[#46b450] dark:border-[#6a9955] text-[#46b450] dark:text-[#6a9955] text-sm"
            >
              Your password has been reset. Please sign in.
            </div>
          )}
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
                htmlFor="user_login"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Email
              </label>
              <input
                id="user_login"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="user_pass"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Password
              </label>
              <input
                id="user_pass"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#8c8f94] dark:border-[#5a5a5a] text-[#2271B1] dark:text-[#4fc1ff] focus:ring-[#2271B1] dark:focus:ring-[#4fc1ff] cursor-pointer"
                />
                <span className="text-sm text-[#50575e] dark:text-[#969696]">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#2271B1] dark:text-[#4fc1ff] hover:text-[#135e96] dark:hover:text-[#75beff] transition-colors"
              >
                Lost your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2271B1] dark:bg-[#0e639c] hover:bg-[#135e96] dark:hover:bg-[#1177bb] disabled:bg-[#2271B1]/50 dark:disabled:bg-[#0e639c]/50 text-white font-medium rounded transition-colors duration-150 cursor-pointer"
            >
              {loading ? 'Log In…' : 'Log In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            to="/"
            className="text-sm text-[#50575e] dark:text-[#969696] hover:text-[#135e96] dark:hover:text-[#75beff] transition-colors"
          >
            &larr; Back to SuKit
          </Link>
          <p className="text-sm text-[#646970] dark:text-[#6e6e6e]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-[#2271B1] dark:text-[#4fc1ff] hover:text-[#135e96] dark:hover:text-[#75beff] transition-colors font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
