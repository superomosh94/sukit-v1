import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { reviewsApi } from '../services/api';
import { cn } from '../utils/cn';
export function ReviewModeration() {
  const [reviews, setR] = useState<any[]>([]);
  const [l, setL] = useState(true);
  const load = async () => {
    const d = await reviewsApi.list();
    setR(d);
    setL(false);
  };
  useEffect(() => {
    load();
  }, []);
  const handleApprove = async (id: string) => {
    await reviewsApi.approve(id);
    setR(reviews.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
  };
  const handleReject = async (id: string) => {
    await reviewsApi.reject(id);
    setR(reviews.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)));
  };
  const handleSpam = async (id: string) => {
    await reviewsApi.markSpam(id);
    setR(reviews.map((r) => (r.id === id ? { ...r, status: 'SPAM' } : r)));
  };
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        <p className="text-gray-500 text-sm">
          Approve, reject, or flag reviews as spam
        </p>
      </div>
      <div className="space-y-2">
        {reviews
          .filter((r) => r.status === 'PENDING')
          .map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border"
            >
              <div className="flex justify-between">
                <div>
                  <span className="font-medium">{r.title}</span>
                  <span className="ml-2 text-yellow-500 text-sm">
                    {'★'.repeat(r.rating)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApprove(r.id!)}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(r.id!)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSpam(r.id!)}
                    className="p-1 hover:bg-yellow-100 rounded text-yellow-600"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {r.content?.slice(0, 150)}
              </p>
              <div className="text-xs text-gray-400 mt-1">
                by {r.userName} on {r.productName}
              </div>
            </div>
          ))}
        {!l && reviews.filter((r) => r.status === 'PENDING').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No reviews pending moderation
          </div>
        )}
      </div>
    </div>
  );
}
