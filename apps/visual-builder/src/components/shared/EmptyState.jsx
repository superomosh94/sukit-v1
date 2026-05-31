import React from 'react';

export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {description && <p className="text-gray-600 mb-4">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
