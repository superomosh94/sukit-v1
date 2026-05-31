// src/components/dashboard/RecentProjectsList.jsx
import React from 'react';

export default function RecentProjectsList({ projects = [] }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-medium mb-2">Recent Projects</h3>
      <ul className="space-y-2">
        {projects.map((proj) => (
          <li key={proj.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <span>{proj.name}</span>
            <span className="text-sm text-gray-500">{proj.updated}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
