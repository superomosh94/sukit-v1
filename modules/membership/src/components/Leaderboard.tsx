import { useEffect, useState } from 'react';
import { Award, Trophy, Medal, TrendingUp } from 'lucide-react';
import { membershipApi } from '../services/api';
import { cn } from '../utils/cn';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipApi.getLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return (
      <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
        {rank + 1}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </h3>
      </div>
      {loading ? (
        <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
      ) : leaders.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No members yet
        </div>
      ) : (
        leaders.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              {getRankIcon(i)}
              <div>
                <span className="font-medium text-sm">{m.name}</span>
                <span className="text-xs text-gray-500 ml-2">{m.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Award className="w-3 h-3 text-yellow-500" />
              {m.points || 0}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
