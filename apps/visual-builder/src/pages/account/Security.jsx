import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Key, Save, Eye, EyeOff, Check } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

const Security = () => {
    const { user, updatePassword, enable2FA, disable2FA } = useUserStore();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [qrCode, setQrCode] = useState('');

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
        updatePassword(passwordData);
        alert('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleEnable2FA = () => {
        // In a real app, fetch QR code from backend
        setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SuKit:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SuKit');
        setShow2FAModal(true);
    };

    const handleVerify2FA = () => {
        if (verificationCode === '123456') { // Demo verification
            setTwoFactorEnabled(true);
            enable2FA();
            setShow2FAModal(false);
            setVerificationCode('');
            alert('Two-factor authentication enabled successfully!');
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    const handleDisable2FA = () => {
        if (confirm('Are you sure you want to disable two-factor authentication?')) {
            setTwoFactorEnabled(false);
            disable2FA();
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
                        <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-3 flex items-center gap-2">
                            <Check className="w-4 h-4 text-success-500" />
                            <p className="text-sm text-success-500">Two-factor authentication is enabled</p>
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

            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-semibold text-text-primary">Setup Two-Factor Authentication</h2>
                            <button onClick={() => setShow2FAModal(false)} className="p-1 rounded hover:bg-surface-light">
                                <span className="text-2xl text-text-secondary">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-text-secondary">
                                Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                            </p>
                            {qrCode && (
                                <div className="flex justify-center">
                                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-border">
                            <button
                                onClick={() => setShow2FAModal(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerify2FA}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Verify & Enable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Security;
