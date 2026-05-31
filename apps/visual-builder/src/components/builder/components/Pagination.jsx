import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * Pagination component for navigating between pages.
 * Props:
 * - totalPages (number): total number of pages.
 * - current (number): current active page (default 1).
 * - onPageChange (function): callback when page changes.
 */
export const Pagination = ({ totalPages = 5, current = 1, onPageChange }) => {
  const [page, setPage] = React.useState(current);

  const handlePrev = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      onPageChange && onPageChange(newPage);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      onPageChange && onPageChange(newPage);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', 'pagination')}>
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className={cn('px-2 py-1 bg-gray-200 rounded disabled:opacity-50')}
      >
        Prev
      </button>
      <span className="text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className={cn('px-2 py-1 bg-gray-200 rounded disabled:opacity-50')}
      >
        Next
      </button>
    </div>
  );
};
