import { useEffect, useState } from 'react';
import { Plus, Send, BarChart3 } from 'lucide-react';
import { newsletterApi } from '../services/api';
import { cn } from '../utils/cn';
export function CampaignList() {
  const [camps, setC] = useState<any[]>([]);
  const [l, setL] = useState(true);
  useEffect(() => {
    newsletterApi.listCampaigns().then((d) => {
      setC(d);
      setL(false);
    });
  }, []);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-gray-500 text-sm">
            Create and manage email campaigns
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>
      <div className="space-y-2">
        {camps.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.subject}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border',
                  c.status === 'SENT'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                )}
              >
                {c.status}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {c.opens} opens
              </span>
              {c.status === 'DRAFT' && (
                <button
                  onClick={async () => {
                    await newsletterApi.sendCampaign(c.id!);
                    setC(
                      camps.map((x) =>
                        x.id === c.id ? { ...x, status: 'SENT' } : x
                      )
                    );
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              )}
            </div>
          </div>
        ))}
        {!l && camps.length === 0 && (
          <div className="text-center py-8 text-gray-500">No campaigns yet</div>
        )}
      </div>
    </div>
  );
}
