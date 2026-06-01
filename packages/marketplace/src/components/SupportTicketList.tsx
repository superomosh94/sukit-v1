'use client';

import { useState } from 'react';
import type {
  TicketData,
  TicketPriority,
  TicketStatus,
  TicketCategory,
} from '../types';

interface SupportTicketListProps {
  tickets: TicketData[];
  total: number;
  onCreateTicket: () => void;
  onSelectTicket: (ticketId: string) => void;
  onFilterChange: (filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
  }) => void;
  loading?: boolean;
}

export function SupportTicketList({
  tickets,
  total,
  onCreateTicket,
  onSelectTicket,
  onFilterChange,
  loading,
}: SupportTicketListProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');

  const priorityColors: Record<TicketPriority, string> = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };
  const statusColors: Record<TicketStatus, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-200 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Support Tickets ({total})
        </h2>
        <button
          onClick={onCreateTicket}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          + New Ticket
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as TicketStatus | '');
            onFilterChange({
              status: e.target.value as TicketStatus | undefined,
              priority: priorityFilter as TicketPriority | undefined,
            });
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as TicketPriority | '');
            onFilterChange({
              status: statusFilter as TicketStatus | undefined,
              priority: e.target.value as TicketPriority | undefined,
            });
          }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No tickets found.</p>
          <button
            onClick={onCreateTicket}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Create a support ticket
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {ticket.subject}
                    </h3>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[ticket.status]}`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {ticket.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>{ticket.moduleName}</span>
                    <span>{ticket.category}</span>
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.responses && (
                      <span>
                        {ticket.responses.length} response
                        {ticket.responses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
