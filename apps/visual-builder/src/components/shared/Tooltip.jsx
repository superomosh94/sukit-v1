import React from 'react';

export default function Tooltip({ children, content }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm rounded py-1 px-2 mt-1 whitespace-nowrap">
        {content}
      </div>
    </div>
  );
}
