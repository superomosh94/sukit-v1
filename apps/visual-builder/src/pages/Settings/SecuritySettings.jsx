import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Key, Save, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const SecuritySettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings.security?.twoFactorEnabled || false);

    const handlePasswordChange = (key, value) => {
        setPasswordData(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdatePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        alert('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleEnable2FA = () => {
        setTwoFactorEnabled(true);
        updateSettings('security', { twoFactorEnabled: true });
        alert('2FA enabled! Please scan the QR code with your authenticator app.');
    };

    const handleDisable2FA = () => {
        if (confirm('Are you sure you want to disable two-factor authentication?')) {
            setTwoFactorEnabled(false);
            updateSettings('security', { twoFactorEnabled: false });
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Security Settings</h3>
            </div>

            {/* Change Password */}
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary-500" />
                    <h4 className="font-medium text-text-primary">Change Password</h4>
                </div>
                
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                        </button>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm text-text-secondary mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                        </button>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={handleUpdatePassword}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Update Password
                </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary-500" />
                    <h4 className="font-medium text-text-primary">Two-Factor Authentication</h4>
                </div>
                <p className="text-sm text-text-secondary">
                    Add an extra layer of security to your account by requiring a verification code from your mobile device.
                </p>
                {twoFactorEnabled ? (
                    <>
                        <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-3">
                            <p className="text-sm text-success-500">✓ Two-factor authentication is enabled</p>
                        </div>
                        <button
                            onClick={handleDisable2FA}
                            className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
                        >
                            Disable 2FA
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEnable2FA}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Enable 2FA
                    </button>
                )}
            </div>

            {/* Session Management */}
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary-500" />
                    <h4 className="font-medium text-text-primary">Active Sessions</h4>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                        <div>
                            <p className="text-sm text-text-primary">Chrome on Windows</p>
                            <p className="text-xs text-text-secondary">New York, USA • Active now</p>
                        </div>
                        <button className="text-xs text-danger-500 hover:underline">Revoke</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                        <div>
                            <p className="text-sm text-text-primary">Safari on MacBook</p>
                            <p className="text-xs text-text-secondary">London, UK • 2 hours ago</p>
                        </div>
                        <button className="text-xs text-danger-500 hover:underline">Revoke</button>
                    </div>
                </div>
                <button className="text-sm text-danger-500 hover:underline">
                    Log Out All Other Devices
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
