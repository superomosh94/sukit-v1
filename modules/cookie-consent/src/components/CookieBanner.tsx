import { useState } from 'react';
import { Cookie, X, Check, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  config: {
    layout: string;
    position: string;
    theme: string;
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    cookiePolicyUrl: string;
  };
  onAccept: (consent: Record<string, boolean>) => void;
}

export function CookieBanner({ config, onAccept }: Props) {
  const [visible, setV] = useState(true);
  const [showDetails, setSD] = useState(false);
  const [consent, setC] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  if (!visible) return null;
  const positionClass = config.position === 'top' ? 'top-0' : 'bottom-0';
  return (
    <div className={cn('fixed left-0 right-0 z-50 p-4', positionClass)}>
      <div
        className={cn(
          'max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border p-4',
          config.layout === 'modal' && 'max-w-md mx-auto relative top-20'
        )}
      >
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Cookie Consent</h3>
            <p className="text-sm text-gray-500 mt-1">
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic.
            </p>
            {showDetails && (
              <div className="mt-3 space-y-1">
                {['necessary', 'analytics', 'marketing', 'preferences'].map(
                  (c) => {
                    const key = c as keyof typeof consent;
                    return (
                      <label
                        key={c}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={consent[key]}
                          onChange={(e) =>
                            setC({ ...consent, [key]: e.target.checked })
                          }
                          disabled={c === 'necessary'}
                        />
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                        {c === 'necessary' && (
                          <span className="text-xs text-gray-400">
                            (required)
                          </span>
                        )}
                      </label>
                    );
                  }
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() =>
                  onAccept(
                    Object.fromEntries(
                      Object.keys(consent).map((k) => [k, true])
                    )
                  )
                }
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Accept All
              </button>
              <button
                onClick={() => onAccept(consent)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setSD(!showDetails)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                {showDetails ? 'Hide' : 'Customize'}
              </button>
              {config.cookiePolicyUrl && (
                <a
                  href={config.cookiePolicyUrl}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Cookie Policy
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setV(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
