import React, { useState } from 'react';
import { Lock, Unlock, Calendar } from 'lucide-react';

export interface BlockLockingProps {
  isLocked: boolean;
  onToggleLock: () => void;
  lockedBy?: string;
  scheduledPublish?: Date;
  onSchedulePublish?: (date: Date) => void;
}

export function BlockLocking({
  isLocked,
  onToggleLock,
  lockedBy,
  scheduledPublish,
  onSchedulePublish,
}: BlockLockingProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(
    scheduledPublish?.toISOString().slice(0, 16) || ''
  );

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border">
      <button
        onClick={onToggleLock}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${
          isLocked
            ? 'bg-yellow-500/10 text-yellow-600'
            : 'hover:bg-accent text-muted-foreground'
        }`}
        title={isLocked ? `Locked by ${lockedBy || 'you'}` : 'Lock block'}
      >
        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        <span>{isLocked ? 'Locked' : 'Lock'}</span>
      </button>

      <button
        onClick={() => setShowSchedule(!showSchedule)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md hover:bg-accent text-muted-foreground transition-colors"
      >
        <Calendar size={12} />
        <span>{scheduledPublish ? 'Scheduled' : 'Schedule'}</span>
      </button>

      {showSchedule && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="px-2 py-1 text-xs bg-muted border border-border rounded"
          />
          <button
            onClick={() => {
              if (scheduleDate && onSchedulePublish)
                onSchedulePublish(new Date(scheduleDate));
              setShowSchedule(false);
            }}
            className="px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground"
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}
