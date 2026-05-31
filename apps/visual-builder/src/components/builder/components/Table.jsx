import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Table = ({ 
    columns = [], 
    data = [], 
    sortable = true,
    searchable = true,
    pagination = true,
    pageSize = 10,
    className 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data
    let filteredData = [...data];
    if (searchTerm) {
        filteredData = filteredData.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    // Sort data
    if (sortColumn) {
        filteredData.sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginate data
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = pagination
        ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : filteredData;

    const handleSort = (column) => {
        if (!sortable) return;
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search */}
            {searchable && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => handleSort(col.key)}
                                    className={cn(
                                        'px-4 py-3 text-left text-sm font-semibold text-text-primary',
                                        sortable && 'cursor-pointer hover:bg-surface-light'
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortable && sortColumn === col.key && (
                                            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-border hover:bg-surface-light">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-4 py-3 text-sm text-text-secondary">
                                        {row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-text-primary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

Table.displayName = 'Table';
export default Table;