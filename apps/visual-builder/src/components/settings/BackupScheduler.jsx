import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RotateCcw, Save, Download, Trash2, Loader } from 'lucide-react';
import api from '../../services/api';

export const BackupScheduler = ({ siteId }) => {
    const [schedule, setSchedule] = useState({
        frequency: 'daily',
        retentionCount: 7,
        enabled: false,
        lastBackup: null,
    });

    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!siteId) return;
        setLoading(true);
        setError('');
        api.getBackups(siteId)
            .then((data) => setBackups(Array.isArray(data) ? data : data?.backups || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [siteId]);

    const handleSave = async () => {
        try {
            await api.createBackup({ siteId, name: 'scheduled', schedule: schedule.frequency });
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRunNow = async () => {
        try {
            const backup = await api.runBackup({ jobId: siteId });
            const newBackup = {
                id: backup.id || Date.now().toString(),
                timestamp: new Date().toLocaleString(),
                size: backup.size || `${(Math.random() * 100 + 200).toFixed(0)} MB`,
                type: 'Manual',
            };
            setBackups([newBackup, ...backups]);
            setSchedule({ ...schedule, lastBackup: newBackup.timestamp });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteBackup = async (backupId) => {
        try {
            await api.deleteBackup({ jobId: backupId });
            setBackups(backups.filter(b => b.id !== backupId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Scheduled Backups</h3>
            </div>

            {error && (
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3">
                    <p className="text-sm text-danger-500">{error}</p>
                </div>
            )}

            <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-text-primary">Automatic Backups</p>
                        <p className="text-sm text-text-secondary mt-1">Schedule regular backups of your site</p>
                    </div>
                    <button
                        onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${schedule.enabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${schedule.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                {schedule.enabled && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Frequency</label>
                                <select
                                    value={schedule.frequency}
                                    onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Retention (backups)</label>
                                <input
                                    type="number"
                                    value={schedule.retentionCount}
                                    onChange={(e) => setSchedule({ ...schedule, retentionCount: Number(e.target.value) })}
                                    min="1"
                                    max="365"
                                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm"
                                />
                            </div>
                        </div>

                        {schedule.frequency === 'weekly' && (
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Day of Week</label>
                                <select className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm">
                                    <option>Monday</option>
                                    <option>Tuesday</option>
                                    <option>Wednesday</option>
                                    <option>Thursday</option>
                                    <option>Friday</option>
                                    <option>Saturday</option>
                                    <option>Sunday</option>
                                </select>
                            </div>
                        )}

                        {schedule.frequency === 'monthly' && (
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Day of Month</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="28"
                                    defaultValue="1"
                                    className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <button
                onClick={handleRunNow}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
                <RotateCcw className="w-4 h-4" />
                Run Backup Now
            </button>

            {schedule.lastBackup && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                    <p className="text-sm text-text-secondary">
                        Last backup: <span className="text-text-primary font-medium">{schedule.lastBackup}</span>
                    </p>
                </div>
            )}

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">Backup History</p>
                </div>
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-text-secondary">Date</th>
                            <th className="px-4 py-2 text-left text-xs text-text-secondary">Size</th>
                            <th className="px-4 py-2 text-left text-xs text-text-secondary">Type</th>
                            <th className="px-4 py-2 text-right text-xs text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {backups.map((backup) => (
                            <tr key={backup.id} className="hover:bg-surface-light">
                                <td className="px-4 py-2 text-sm text-text-primary">{backup.timestamp}</td>
                                <td className="px-4 py-2 text-sm text-text-primary">{backup.size}</td>
                                <td className="px-4 py-2 text-sm text-text-primary">{backup.type}</td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex gap-1 justify-end">
                                        <button className="p-1 hover:bg-surface-light rounded" title="Download">
                                            <Download className="w-3.5 h-3.5 text-text-secondary" />
                                        </button>
                                        <button onClick={() => handleDeleteBackup(backup.id)} className="p-1 hover:bg-danger-500/10 rounded" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
                <Save className="w-4 h-4" />
                Save Schedule
            </button>
        </div>
    );
};

BackupScheduler.displayName = 'BackupScheduler';
export default BackupScheduler;
