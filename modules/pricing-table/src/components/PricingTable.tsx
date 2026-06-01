import { useState } from 'react';
import { cn } from '../utils/cn';
interface Props {
  plans: Array<{
    id?: string;
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    highlighted: boolean;
    ctaText: string;
    ctaUrl: string;
    currency: string;
  }>;
}
export function PricingTable({ plans }: Props) {
  const [annual, setA] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setA(false)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium',
              !annual ? 'bg-white shadow' : ''
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setA(true)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium',
              annual ? 'bg-white shadow' : ''
            )}
          >
            Annual
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              'relative bg-white dark:bg-gray-800 rounded-xl p-6 border text-center',
              p.highlighted && 'ring-2 ring-blue-500 shadow-lg scale-105'
            )}
          >
            {p.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                Popular
              </span>
            )}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.description}</p>
            <div className="my-4">
              <span className="text-4xl font-bold">
                ${annual ? p.yearlyPrice : p.monthlyPrice}
              </span>
              <span className="text-gray-500">
                /{annual ? 'year' : 'month'}
              </span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-left">
              {p.features?.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                'w-full py-2 rounded-lg text-sm font-medium',
                p.highlighted
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              )}
            >
              {p.ctaText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
