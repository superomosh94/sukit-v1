'use client';

import { useState } from 'react';

export default function SupportTicketsPage() {
  const [tickets] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    category: 'question',
  });

  async function createTicket() {
    await fetch('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setShowNew(false);
    setForm({
      subject: '',
      message: '',
      priority: 'normal',
      category: 'question',
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Get help with your modules and sites.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          + New Ticket
        </button>
      </div>
      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            New Support Ticket
          </h2>
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm((p) => ({ ...p, subject: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <textarea
            placeholder="Describe your issue..."
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm((p) => ({ ...p, message: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md text-sm resize-y"
          />
          <div className="flex gap-3">
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((p) => ({ ...p, priority: e.target.value }))
              }
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="question">Question</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
              <option value="billing">Billing</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createTicket}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md"
            >
              Submit
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {tickets.length === 0 && !showNew && (
        <p className="text-sm text-gray-500 text-center py-8">
          No tickets yet. Create a support ticket to get help.
        </p>
      )}
    </div>
  );
}
