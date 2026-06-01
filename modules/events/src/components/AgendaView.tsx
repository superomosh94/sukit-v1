interface Props {
  sessions: Array<{
    id?: string;
    title: string;
    speaker?: string;
    startTime: string;
    endTime: string;
  }>;
}

export function AgendaView({ sessions }: Props) {
  if (!sessions.length)
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No sessions scheduled
      </div>
    );

  const sorted = [...sessions].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {sorted.map((s, i) => (
          <div key={s.id || i} className="relative pl-10">
            <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
              <div className="font-medium">{s.title}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>
                  {s.startTime?.slice(11, 16)} - {s.endTime?.slice(11, 16)}
                </span>
                {s.speaker && <span>Speaker: {s.speaker}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
