import { useState } from 'react';
import { Save, Send, Eye } from 'lucide-react';
export function CampaignEditor() {
  const [form, setF] = useState({
    name: '',
    subject: '',
    preheader: '',
    content: '',
  });
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaign Editor</h1>
        <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
      <input
        value={form.name}
        onChange={(e) => setF({ ...form, name: e.target.value })}
        placeholder="Campaign name"
        className="w-full p-2 border rounded text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={form.subject}
          onChange={(e) => setF({ ...form, subject: e.target.value })}
          placeholder="Email subject"
          className="p-2 border rounded text-sm"
        />
        <input
          value={form.preheader}
          onChange={(e) => setF({ ...form, preheader: e.target.value })}
          placeholder="Preheader text"
          className="p-2 border rounded text-sm"
        />
      </div>
      <div className="border rounded">
        <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
          <button className="p-1 hover:bg-gray-200 rounded text-sm">B</button>
          <button className="p-1 hover:bg-gray-200 rounded text-sm italic">
            I
          </button>
          <button className="p-1 hover:bg-gray-200 rounded text-sm underline">
            U
          </button>
        </div>
        <textarea
          value={form.content}
          onChange={(e) => setF({ ...form, content: e.target.value })}
          placeholder="Write your email content here..."
          className="w-full p-4 h-64 text-sm font-mono outline-none resize-none"
        />
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Eye className="w-4 h-4" />
          Preview
        </h4>
        <div className="bg-white rounded p-4 border text-sm max-w-md">
          {form.content || '(no content)'}
        </div>
      </div>
    </div>
  );
}
