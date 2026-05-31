import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, X, LogOut, Shield } from 'lucide-react';

const Sessions = () => {
    const [sessions, setSessions] = useState([
        { 
            id: 1, 
            device: 'desktop', 
            deviceName: 'Chrome on Windows', 
            location: 'New York, USA', 
            ip: '192.168.1.1',
            lastActive: 'Active now',
            isCurrent: true,
            browser: 'Chrome 120',
            os: 'Windows 11'
        },
        { 
            id: 2, 
            device: 'mobile', 
            deviceName: 'Safari on iPhone', 
            location: 'New York, USA', 
            ip: '192.168.1.2',
            lastActive: '2 hours ago',
            isCurrent: false,
            browser: 'Safari 17',
            os: 'iOS 17'
        },
        { 
            id: 3, 
            device: 'tablet', 
            deviceName: 'Chrome on iPad', 
            location: 'London, UK', 
            ip: '185.15.0.1',
            lastActive: 'Yesterday',
            isCurrent: false,
            browser: 'Chrome 119',
            os: 'iPadOS 17'
        },
    ]);

    const getDeviceIcon = (device) => {
        switch (device) {
            case 'mobile': return <Smartphone className="w-5 h-5" />;
            case 'tablet': return <Tablet className="w-5 h-5" />;
            default: return <Monitor className="w-5 h-5" />;
        }
    };

    const handleRevoke = (sessionId) => {
        if (confirm('Are you sure you want to revoke this session?')) {
            setSessions(sessions.filter(s => s.id !== sessionId));
        }
    };

    const handleRevokeAllOthers = () => {
        if (confirm('This will log you out of all other devices. Continue?')) {
            setSessions(sessions.filter(s => s.isCurrent));
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">Active Sessions</h3>
                </div>
                <button
                    onClick={handleRevokeAllOthers}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-danger-500/10 text-danger-500 rounded-lg hover:bg-danger-500/20 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Log Out All Others
                </button>
            </div>

            <div className="space-y-3">
                {sessions.map((session) => (
                    <div key={session.id} className="bg-surface border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                    session.isCurrent ? 'bg-primary-500/20' : 'bg-surface-light'
                                }`}>
                                    {getDeviceIcon(session.device)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-text-primary">{session.deviceName}</p>
                                        {session.isCurrent && (
                                            <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded">
                                                Current Session
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {session.location} • {session.ip}
                                    </p>
                                    <div className="flex gap-3 mt-2 text-xs text-text-secondary">
                                        <span>{session.browser}</span>
                                        <span>•</span>
                                        <span>{session.os}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Last active: {session.lastActive}
                                    </p>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    className="p-2 rounded-lg hover:bg-danger-500/10 transition-colors"
                                    title="Revoke Session"
                                >
                                    <X className="w-4 h-4 text-danger-500" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">Security Tip</p>
                        <p className="text-xs text-text-secondary mt-1">
                            If you don't recognize a device, revoke it immediately and change your password.
                            Regular session reviews help keep your account secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sessions;
