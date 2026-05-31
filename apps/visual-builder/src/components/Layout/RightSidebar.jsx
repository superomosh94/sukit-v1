import React, { useState, useRef } from 'react';
import { X, Settings, Eye, Code, History, Share2, RotateCcw, Link, Check, Copy, Globe, Lock } from 'lucide-react';

const defaultDoc = {
  status: 'draft',
  visibility: 'public',
  password: '',
  publishDate: '',
  slug: '/my-page',
  featuredImage: null,
  excerpt: '',
  allowComments: true,
  allowPingbacks: true,
};

const RightSidebar = ({ onClose, onUpdate, onPreview }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [doc, setDoc] = useState(defaultDoc);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'history', label: 'History', icon: History },
    { id: 'share', label: 'Share', icon: Share2 },
  ];

  const handleUpdate = () => {
    if (onUpdate) onUpdate(doc);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDoc({ ...doc, featuredImage: URL.createObjectURL(file) });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(doc.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const update = (field, value) => setDoc({ ...doc, [field]: value });

  const historyEntries = [
    { version: 'v1.2', date: '2 hours ago', author: 'You', changes: 'Updated hero section' },
    { version: 'v1.1', date: '1 day ago', author: 'John', changes: 'Fixed typo in footer' },
    { version: 'v1.0', date: '3 days ago', author: 'Jane', changes: 'Initial publish' },
  ];

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Document Settings</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light">
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Status</label>
              <select value={doc.status} onChange={(e) => update('status', e.target.value)} className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="private">Private</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Visibility</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" checked={doc.visibility === 'public'} onChange={() => update('visibility', 'public')} className="text-primary-500" />
                  <Globe className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-sm text-text-primary">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" checked={doc.visibility === 'password'} onChange={() => update('visibility', 'password')} className="text-primary-500" />
                  <Lock className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-sm text-text-primary">Password Protected</span>
                </label>
                {doc.visibility === 'password' && (
                  <input type="text" value={doc.password} onChange={(e) => update('password', e.target.value)} placeholder="Enter password" className="ml-5 w-[calc(100%-20px)] px-3 py-1.5 bg-surface-light border border-border rounded-lg text-text-primary text-sm" />
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibility" checked={doc.visibility === 'private'} onChange={() => update('visibility', 'private')} className="text-primary-500" />
                  <Lock className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-sm text-text-primary">Private</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Publish Date</label>
              <input type="datetime-local" value={doc.publishDate} onChange={(e) => update('publishDate', e.target.value)} className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm" />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">URL Slug</label>
              <input type="text" value={doc.slug} onChange={(e) => update('slug', e.target.value)} className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm" />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Featured Image</label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${doc.featuredImage ? 'border-primary-500' : 'border-border'}`}>
                {doc.featuredImage ? (
                  <div className="relative">
                    <img src={doc.featuredImage} alt="Featured" className="max-h-28 mx-auto rounded object-cover" />
                    <button onClick={() => update('featuredImage', null)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleImageSelect} className="text-sm text-primary-500">Set featured image</button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Excerpt</label>
              <textarea rows={3} value={doc.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-text-primary text-sm" placeholder="Optional excerpt..." />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-text-primary">Allow Comments</span>
                <input type="checkbox" checked={doc.allowComments} onChange={(e) => update('allowComments', e.target.checked)} className="text-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-text-primary">Allow Pingbacks</span>
                <input type="checkbox" checked={doc.allowPingbacks} onChange={(e) => update('allowPingbacks', e.target.checked)} className="text-primary-500" />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-surface-light rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-2">STATUS</div>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${doc.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm font-medium text-text-primary capitalize">{doc.status}</span>
              </div>
            </div>
            <div className="bg-surface-light rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-2">SLUG</div>
              <div className="text-sm text-text-primary">{doc.slug}</div>
            </div>
            <div className="bg-surface-light rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-2">VISIBILITY</div>
              <div className="text-sm text-text-primary capitalize">{doc.visibility}</div>
            </div>
            {doc.featuredImage && (
              <div className="bg-surface-light rounded-lg p-4">
                <div className="text-xs text-text-secondary mb-2">FEATURED IMAGE</div>
                <img src={doc.featuredImage} alt="Featured" className="w-full rounded object-cover max-h-32" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Embed Code</span>
              <button onClick={handleCopyLink} className="p-1 rounded hover:bg-surface-light">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
              </button>
            </div>
            <pre className="bg-surface-light border border-border rounded-lg p-3 text-xs text-text-secondary overflow-x-auto">
{`<script>
  sukit.render("${doc.slug}", {
    status: "${doc.status}",
    visibility: "${doc.visibility}"
  });
</script>`}
            </pre>
            <div className="bg-surface-light border border-border rounded-lg p-3">
              <div className="text-xs font-mono text-text-secondary whitespace-pre-wrap">
{`{
  "slug": "${doc.slug}",
  "status": "${doc.status}",
  "visibility": "${doc.visibility}",
  "excerpt": "${doc.excerpt}",
  "allowComments": ${doc.allowComments}
}`}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {historyEntries.map((entry, i) => (
              <div key={i} className="flex gap-3 p-3 bg-surface-light rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                  {i < historyEntries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-primary">{entry.version}</span>
                    <span className="text-xs text-text-secondary">{entry.date}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{entry.changes}</p>
                  <span className="text-xs text-text-secondary">by {entry.author}</span>
                  <button className="flex items-center gap-1 mt-1.5 text-xs text-primary-500 hover:text-primary-400">
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Share Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-secondary truncate">
                  <Link className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{doc.slug}</span>
                </div>
                <button onClick={handleCopyLink} className="p-2 bg-surface-light border border-border rounded-lg hover:bg-surface-light/80">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-primary">Embed</label>
              <div className="bg-surface-light border border-border rounded-lg p-3">
                <pre className="text-xs text-text-secondary overflow-x-auto">{`<iframe src="/embed${doc.slug}" width="100%" height="500"></iframe>`}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex gap-3">
        <button onClick={handleUpdate} className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${saved ? 'bg-green-600' : 'bg-primary-500 hover:bg-primary-600'}`}>
          {saved ? 'Saved' : 'Update'}
        </button>
        <button onClick={onPreview} className="px-4 py-2 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-light/80 transition-colors">
          Preview
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
