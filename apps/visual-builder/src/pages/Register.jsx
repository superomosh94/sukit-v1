import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useThemeStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.register(form.email, form.password, form.name);
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
          <Link to="/login" className="w-20 h-20 bg-[#2271B1] dark:bg-[#0e639c] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm hover:bg-[#135e96] dark:hover:bg-[#1177bb] transition-colors">
            <span className="text-white text-4xl font-bold tracking-tight">S</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1d2327] dark:text-[#cccccc]">Create Account</h1>
          <p className="text-sm text-[#646970] dark:text-[#969696] mt-1">Join SuKit Visual Builder</p>
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
                htmlFor="reg_name"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="reg_name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
                autoFocus
                autoComplete="name"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="reg_email"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="reg_email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="reg_pass"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg_pass"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                htmlFor="reg_pass_confirm"
                className="block text-sm font-medium text-[#1d2327] dark:text-[#cccccc] mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="reg_pass_confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat your password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-white dark:bg-[#3c3c3c] border border-[#8c8f94] dark:border-[#3c3c3c] rounded text-[#1d2327] dark:text-[#cccccc] placeholder-[#8c8f94] dark:placeholder-[#6e6e6e] focus:outline-none focus:border-[#2271B1] dark:focus:border-[#4fc1ff] focus:shadow-[0_0_0_1px_#2271B1] dark:focus:shadow-[0_0_0_1px_#4fc1ff] transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2271B1] dark:bg-[#0e639c] hover:bg-[#135e96] dark:hover:bg-[#1177bb] disabled:bg-[#2271B1]/50 dark:disabled:bg-[#0e639c]/50 text-white font-medium rounded transition-colors duration-150 cursor-pointer"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#646970] dark:text-[#6e6e6e]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#2271B1] dark:text-[#4fc1ff] hover:text-[#135e96] dark:hover:text-[#75beff] transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
