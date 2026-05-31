import React, { useState } from 'react';
import { TrendingUp, Users, Eye, MousePointerClick, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
];

const mockVisitorsData = {
    '7d': [
        { date: 'Mon', visitors: 120, pageViews: 340 },
        { date: 'Tue', visitors: 145, pageViews: 410 },
        { date: 'Wed', visitors: 98, pageViews: 280 },
        { date: 'Thu', visitors: 180, pageViews: 520 },
        { date: 'Fri', visitors: 210, pageViews: 600 },
        { date: 'Sat', visitors: 165, pageViews: 450 },
        { date: 'Sun', visitors: 140, pageViews: 380 },
    ],
    '30d': Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        visitors: Math.floor(Math.random() * 200) + 50,
        pageViews: Math.floor(Math.random() * 600) + 100,
    })),
    '90d': Array.from({ length: 12 }, (_, i) => ({
        date: `Week ${i + 1}`,
        visitors: Math.floor(Math.random() * 1000) + 500,
        pageViews: Math.floor(Math.random() * 3000) + 1000,
    })),
};

const mockTopPages = [
    { path: '/', title: 'Home', views: 12450, visitors: 8900 },
    { path: '/about', title: 'About Us', views: 3200, visitors: 2100 },
    { path: '/pricing', title: 'Pricing', views: 2800, visitors: 1950 },
    { path: '/contact', title: 'Contact', views: 1800, visitors: 1200 },
    { path: '/blog', title: 'Blog', views: 1500, visitors: 980 },
];

export const SiteAnalytics = () => {
    const [timeRange, setTimeRange] = useState('7d');

    const data = mockVisitorsData[timeRange] || mockVisitorsData['7d'];
    const totalVisitors = data.reduce((s, d) => s + d.visitors, 0);
    const totalPageViews = data.reduce((s, d) => s + d.pageViews, 0);
    const avgVisitors = Math.round(totalVisitors / data.length);
    const maxVisitors = Math.max(...data.map((d) => d.visitors));
    const maxViews = Math.max(...data.map((d) => d.pageViews));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">Site Analytics</h3>
                </div>
                <div className="flex gap-1 bg-surface-light rounded-lg p-1">
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={cn(
                                'px-3 py-1.5 text-xs rounded-md transition-colors',
                                timeRange === range.value
                                    ? 'bg-primary-500 text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Visitors" value={totalVisitors.toLocaleString()} change="+12%" positive />
                <StatCard icon={Eye} label="Page Views" value={totalPageViews.toLocaleString()} change="+8%" positive />
                <StatCard icon={MousePointerClick} label="Avg. Daily" value={avgVisitors.toLocaleString()} change="-3%" positive={false} />
                <StatCard icon={Calendar} label="Best Day" value={`${maxVisitors}`} change="Peak" />
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-text-primary mb-4">Visitors & Page Views</p>
                <div className="h-48 flex items-end gap-2">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="w-full flex gap-0.5 justify-center" style={{ height: '100%' }}>
                                <div
                                    className="w-2 bg-primary-500/60 rounded-t"
                                    style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                                />
                                <div
                                    className="w-2 bg-secondary-500/60 rounded-t"
                                    style={{ height: `${(d.pageViews / maxViews) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-text-secondary">{d.date}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-2 justify-center">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary-500/60 rounded" />
                        <span className="text-xs text-text-secondary">Visitors</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-secondary-500/60 rounded" />
                        <span className="text-xs text-text-secondary">Page Views</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">Top Pages</p>
                </div>
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-text-secondary">Page</th>
                            <th className="px-4 py-2 text-right text-xs text-text-secondary">Views</th>
                            <th className="px-4 py-2 text-right text-xs text-text-secondary">Visitors</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mockTopPages.map((page) => (
                            <tr key={page.path} className="hover:bg-surface-light">
                                <td className="px-4 py-2">
                                    <p className="text-sm text-text-primary">{page.title}</p>
                                    <p className="text-xs text-text-secondary">{page.path}</p>
                                </td>
                                <td className="px-4 py-2 text-right text-sm text-text-primary">{page.views.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-sm text-text-primary">{page.visitors.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, change, positive }) => (
    <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-text-secondary" />
            <span className="text-xs text-text-secondary">{label}</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {change && (
            <div className={cn(
                'flex items-center gap-1 mt-1 text-xs',
                positive === undefined ? 'text-text-secondary' : positive ? 'text-success-500' : 'text-danger-500'
            )}>
                {positive !== undefined && (positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                {change}
            </div>
        )}
    </div>
);

SiteAnalytics.displayName = 'SiteAnalytics';
export default SiteAnalytics;
