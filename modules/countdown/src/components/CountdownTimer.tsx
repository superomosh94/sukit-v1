import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

interface Props {
  targetDate: string;
  layout?: string;
  onComplete?: () => void;
}

function getTimeRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function CountdownTimer({
  targetDate,
  layout = 'default',
  onComplete,
}: Props) {
  const [time, setTime] = useState(getTimeRemaining(new Date(targetDate)));
  useEffect(() => {
    const i = setInterval(() => {
      const t = getTimeRemaining(new Date(targetDate));
      setTime(t);
      if (t.expired) {
        clearInterval(i);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(i);
  }, [targetDate, onComplete]);
  if (time.expired)
    return (
      <div className="text-center text-lg font-bold text-green-600">
        Time's up!
      </div>
    );
  const boxes = layout === 'circle' ? 'flex gap-4' : 'flex gap-2';
  const boxClass =
    layout === 'circle'
      ? 'w-20 h-20 rounded-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700'
      : 'flex flex-col items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg';
  const valClass =
    layout === 'circle' ? 'text-2xl font-bold' : 'text-3xl font-bold';
  return (
    <div className={cn('justify-center', boxes)}>
      {Object.entries({
        days: time.days,
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds,
      }).map(([k, v]) => (
        <div key={k} className={boxClass}>
          <span className={valClass}>{String(v).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500 uppercase">{k}</span>
        </div>
      ))}
    </div>
  );
}
