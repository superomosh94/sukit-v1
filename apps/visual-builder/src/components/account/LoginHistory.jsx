import React from 'react';
import { History, Monitor, Globe, Smartphone, Clock } from 'lucide-react';

const mockLogins = [
    { id: 1, timestamp: '2024-06-20 14:30:00', ip: '192.168.1.1', device: 'Chrome 120 / Windows 11', location: 'New York, USA', success: true },
    { id: 2, timestamp: '2024-06-19 09:15:00', ip: '192.168.1.1', device: 'Chrome 120 / Windows 11', location: 'New York, USA', success: true },
    { id: 3, timestamp: '2024-06-18 22:45:00', ip: '203.0.113.5', device: 'Safari 17 / iOS 17', location: 'London, UK', success: false },
    { id: 4, timestamp: '2024-06-17 08:00:00', ip: '192.168.1.1', device: 'Chrome 119 / Windows 11', location: 'New York, USA', success: true },
    { id: 5, timestamp: '2024-06-15 16:20:00', ip: '198.51.100.3', device: 'Firefox 126 / macOS 14', location: 'Tokyo, Japan', success: true },
];

export const LoginHistory = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Login History</h3>
            </div>
            <p className="text-sm text-text-secondary">Review recent login attempts to your account</p>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Time</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">IP Address</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Device / Browser</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mockLogins.map((login) => (
                            <tr key={login.id} className="hover:bg-surface-light">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-text-secondary" />
                                        <span className="text-sm text-text-primary">{login.timestamp}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-mono text-text-primary">{login.ip}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-3.5 h-3.5 text-text-secondary" />
                                        <span className="text-sm text-text-primary">{login.device}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-text-secondary" />
                                        <span className="text-sm text-text-primary">{login.location}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        login.success
                                            ? 'bg-success-500/10 text-success-500'
                                            : 'bg-danger-500/10 text-danger-500'
                                    }`}>
                                        {login.success ? 'Success' : 'Failed'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

LoginHistory.displayName = 'LoginHistory';
export default LoginHistory;
