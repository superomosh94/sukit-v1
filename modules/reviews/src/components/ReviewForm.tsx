import { useState } from 'react';
import { StarRating } from './StarRating';
import { Save } from 'lucide-react';
export function ReviewForm({
  onSubmit,
}: {
  onSubmit: (d: any) => Promise<void>;
}) {
  const [f, setF] = useState({
    productName: '',
    userName: '',
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: '',
  });
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border space-y-3 max-w-lg">
      <h3 className="font-bold">Write a Review</h3>
      <input
        value={f.productName}
        onChange={(e) => setF({ ...f, productName: e.target.value })}
        placeholder="Product name"
        className="w-full p-2 border rounded text-sm"
      />
      <input
        value={f.userName}
        onChange={(e) => setF({ ...f, userName: e.target.value })}
        placeholder="Your name"
        className="w-full p-2 border rounded text-sm"
      />
      <div>
        <label className="text-sm block mb-1">Rating</label>
        <StarRating
          value={f.rating}
          onChange={(v) => setF({ ...f, rating: v })}
        />
      </div>
      <input
        value={f.title}
        onChange={(e) => setF({ ...f, title: e.target.value })}
        placeholder="Review title"
        className="w-full p-2 border rounded text-sm"
      />
      <textarea
        value={f.content}
        onChange={(e) => setF({ ...f, content: e.target.value })}
        placeholder="Your review"
        className="w-full p-2 border rounded text-sm"
        rows={4}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={f.pros}
          onChange={(e) => setF({ ...f, pros: e.target.value })}
          placeholder="Pros"
          className="p-2 border rounded text-sm"
        />
        <input
          value={f.cons}
          onChange={(e) => setF({ ...f, cons: e.target.value })}
          placeholder="Cons"
          className="p-2 border rounded text-sm"
        />
      </div>
      <button
        onClick={() => onSubmit(f)}
        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        <Save className="w-4 h-4" />
        Submit Review
      </button>
    </div>
  );
}
