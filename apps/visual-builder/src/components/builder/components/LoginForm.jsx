import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const LoginForm = ({ 
    onLogin,
    onRegister,
    onForgotPassword,
    redirectUrl = '/dashboard',
    className 
}) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (isLogin) {
                await onLogin?.(formData.email, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                await onRegister?.(formData.name, formData.email, formData.password);
            }
            window.location.href = redirectUrl;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('max-w-md mx-auto bg-surface border border-border rounded-lg p-6', className)}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-text-secondary mt-1">
                    {isLogin ? 'Sign in to your account' : 'Join our community today'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-500 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-9 pr-10 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                        </button>
                    </div>
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                                required
                            />
                        </div>
                    </div>
                )}

                {isLogin && (
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-sm text-primary-500 hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Loading...' : <><LogIn className="w-4 h-4" /> {isLogin ? 'Sign In' : 'Sign Up'}</>}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-primary-500 hover:underline"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
};

LoginForm.displayName = 'LoginForm';
export default LoginForm;