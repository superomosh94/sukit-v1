import { useState } from 'react';
import { Eye, Code, Settings, Bell, Monitor, Smartphone } from 'lucide-react';
import { cn } from '../utils/cn';
import { PopupRenderer } from '../components/PopupRenderer';
import type { PopupData } from '../services/api';

const POPUP_TYPES = [
  { id: 'modal', label: 'Modal', desc: 'Centered overlay popup' },
  { id: 'slide-in', label: 'Slide In', desc: 'Slides from screen edge' },
  { id: 'floating-bar', label: 'Floating Bar', desc: 'Fixed bar at bottom' },
  { id: 'fullscreen', label: 'Fullscreen', desc: 'Full page overlay' },
  { id: 'notification', label: 'Notification', desc: 'Corner notification' },
  { id: 'inline', label: 'Inline', desc: 'Embedded in page content' },
];

const TRIGGER_TYPES = [
  { id: 'time', label: 'Time Delay', desc: 'Show after X seconds' },
  { id: 'scroll', label: 'Scroll Percentage', desc: 'Show at scroll depth' },
  { id: 'exit-intent', label: 'Exit Intent', desc: 'Show on leave intent' },
  { id: 'click', label: 'On Click', desc: 'Show on element click' },
  { id: 'inactivity', label: 'Inactivity', desc: 'Show after idle time' },
  { id: 'page-views', label: 'Page Views', desc: 'Show after N page views' },
];

const ANIMATIONS = [
  'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom', 'bounce',
];

interface PopupEditorProps {
  initial?: PopupData;
  onSave: (data: PopupData) => Promise<void>;
}

export function PopupEditor({ initial, onSave }: PopupEditorProps) {
  const [tab, setTab] = useState<'design' | 'trigger' | 'settings'>('design');
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState<Partial<PopupData>>({
    name: initial?.name || '',
    popupType: initial?.popupType || 'modal',
    triggerType: initial?.triggerType || 'time',
    triggerValue: initial?.triggerValue || '5',
    animation: initial?.animation || 'fade',
    animationDuration: initial?.animationDuration || 300,
    content: initial?.content || { html: '<h2>Hello!</h2><p>This is a popup.</p>' },
    pages: initial?.pages || ['*'],
    status: initial?.status || 'DRAFT',
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="p-4 border-b">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Popup name..."
            className="w-full text-lg font-semibold bg-transparent outline-none"
          />
        </div>

        <div className="flex border-b">
          {(['design', 'trigger', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 p-3 text-sm font-medium border-b-2 transition-colors',
                tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'design' ? 'Design' : t === 'trigger' ? 'Trigger' : 'Settings'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {tab === 'design' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Popup Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {POPUP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setForm({ ...form, popupType: type.id })}
                      className={cn(
                        'p-2 text-left rounded-lg border text-sm transition-colors',
                        form.popupType === type.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-300'
                      )}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Animation</label>
                <div className="flex flex-wrap gap-2">
                  {ANIMATIONS.map((anim) => (
                    <button
                      key={anim}
                      onClick={() => setForm({ ...form, animation: anim })}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm border transition-colors',
                        form.animation === anim ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'hover:border-gray-300'
                      )}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Duration (ms)</label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  value={form.animationDuration}
                  onChange={(e) => setForm({ ...form, animationDuration: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{form.animationDuration}ms</span>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">HTML Content</label>
                <textarea
                  value={form.content?.html || ''}
                  onChange={(e) => setForm({ ...form, content: { ...form.content, html: e.target.value } })}
                  rows={8}
                  className="w-full p-2 border rounded text-sm font-mono"
                />
              </div>
            </>
          )}

          {tab === 'trigger' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Trigger Type</label>
                <div className="space-y-2">
                  {TRIGGER_TYPES.map((trigger) => (
                    <button
                      key={trigger.id}
                      onClick={() => setForm({ ...form, triggerType: trigger.id })}
                      className={cn(
                        'w-full p-3 text-left rounded-lg border text-sm transition-colors',
                        form.triggerType === trigger.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-300'
                      )}
                    >
                      <div className="font-medium">{trigger.label}</div>
                      <div className="text-xs text-gray-500">{trigger.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.triggerType === 'time' && (
                <div>
                  <label className="text-sm font-medium block mb-2">Delay (seconds)</label>
                  <input
                    type="number"
                    value={form.triggerValue || '5'}
                    onChange={(e) => setForm({ ...form, triggerValue: e.target.value })}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">Show on Pages</label>
                <input
                  type="text"
                  value={form.pages?.join(', ') || '*'}
                  onChange={(e) => setForm({ ...form, pages: e.target.value.split(',').map(p => p.trim()) })}
                  placeholder="* (all pages), /blog, /about"
                  className="w-full p-2 border rounded text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Wildcards supported: * matches all</p>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Enable analytics tracking</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">GDPR compliant</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={cn('px-3 py-1.5 rounded text-sm flex items-center gap-1', preview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100')}
            >
              {preview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {preview ? 'Code' : 'Preview'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onSave(form as PopupData)} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {preview ? (
            <div className="w-full h-full relative">
              {form.popupType && (
                <PopupRenderer
                  popup={form as any}
                  onClose={() => setPreview(false)}
                  onTrack={() => {}}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 max-w-2xl mx-auto mt-8">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Popup Preview</h3>
                <pre className="text-sm font-mono whitespace-pre-wrap">{form.content?.html || '(no content)'}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
