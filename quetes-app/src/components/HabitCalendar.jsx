import { heatmapForTask } from '../lib/stats';

export default function HabitCalendar({ task, logs, weeks = 12 }) {
  const days = heatmapForTask(task.id, logs, weeks * 7);
  const columns = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  return (
    <div className="bg-surface border border-hairline rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-parchment truncate">{task.title}</p>
        {task.streak > 0 && (
          <span className="text-[10px] font-mono-num text-gold flex-none">🔥 {task.streak}</span>
        )}
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((d) => (
              <div
                key={d.date}
                title={d.date}
                className={`h-2.5 w-2.5 rounded-sm ${
                  d.done ? 'bg-vitality' : 'bg-hairline/60'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
