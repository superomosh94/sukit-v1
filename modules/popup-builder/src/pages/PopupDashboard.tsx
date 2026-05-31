import { useEffect, useState } from 'react';
import { Plus, Eye, MousePointerClick, MoreHorizontal, Play, Pause, Copy, Trash2 } from 'lucide-react';
import { popupApi, PopupData } from '../services/api';
import { cn } from '../utils/cn';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ARCHIVED: 'bg-red-100 text-red-700 border-red-200',
};

export function PopupDashboard() {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPopups = async () => {
    setLoading(true);
    const data = await popupApi.list();
    setPopups(data);
    setLoading(false);
  };

  useEffect(() => { loadPopups(); }, []);

  const totalViews = popups.reduce((sum, p) => sum + (p as any).views || 0, 0);
  const totalConversions = popups.reduce((sum, p) => sum + (p as any).conversions || 0, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Popups</h1>
          <p className="text-gray-500 text-sm">Manage your popup campaigns</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" />
          New Popup
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Popups</p>
          <p className="text-2xl font-bold">{popups.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Views</p>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <p className="text-2xl font-bold">{totalViews}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Conversions</p>
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-green-500" />
            <p className="text-2xl font-bold">{totalConversions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Trigger</th>
                <th className="p-3 font-medium">Views</th>
                <th className="p-3 font-medium">Conversions</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : popups.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No popups yet. Create your first one!</td></tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-3 font-medium">{popup.name}</td>
                    <td className="p-3 text-sm capitalize">{popup.popupType?.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="p-3 text-sm capitalize">{popup.triggerType?.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="p-3 text-sm">{(popup as any).views || 0}</td>
                    <td className="p-3 text-sm">{(popup as any).conversions || 0}</td>
                    <td className="p-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusColors[popup.status] || '')}>
                        {popup.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {popup.status === 'ACTIVE' ? (
                          <button className="p-1 hover:bg-gray-100 rounded" title="Pause"><Pause className="w-4 h-4" /></button>
                        ) : (
                          <button className="p-1 hover:bg-gray-100 rounded" title="Activate"><Play className="w-4 h-4" /></button>
                        )}
                        <button className="p-1 hover:bg-gray-100 rounded" title="Duplicate"><Copy className="w-4 h-4" /></button>
                        <button className="p-1 hover:bg-gray-100 rounded text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
