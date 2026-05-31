import React from 'react';

// ActivityFeed component placeholder
// Displays a list of recent activity items on the dashboard.
// Replace with real data and styling as needed.

export default function ActivityFeed({ activities }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      {activities && activities.length > 0 ? (
        <ul className="space-y-2">
          {activities.map((item, idx) => (
            <li key={idx} className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.type === 'success' ? 'bg-green-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
              <span>{item.message}</span>
              <span className="ml-auto text-sm text-gray-500">{item.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No recent activity.</p>
      )}
    </div>
  );
}
