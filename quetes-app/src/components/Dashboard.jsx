import { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import HabitCalendar from './HabitCalendar';
import { GOALS, MOTIVATIONAL_MESSAGES } from '../lib/contentLibrary';
import { shareStatsCard } from '../lib/shareCard';
import {
  longestCurrentStreak,
  todayCompletionPercent,
  totalCompletions,
  successRate,
  pickMotivation,
} from '../lib/stats';

export default function Dashboard() {
  const { player, tasks, logs } = useGame();
  const [category, setCategory] = useState('all');
  const [sharing, setSharing] = useState(false);

  const filteredTasks = useMemo(
    () => (category === 'all' ? tasks : tasks.filter((t) => t.category === category)),
    [tasks, category]
  );
  const trackables = useMemo(
    () => filteredTasks.filter((t) => t.type === 'daily' || t.type === 'habit'),
    [filteredTasks]
  );
  const dailies = useMemo(() => filteredTasks.filter((t) => t.type === 'daily'), [filteredTasks]);
  const relevantLogs = useMemo(() => {
    if (category === 'all') return logs;
    const ids = new Set(filteredTasks.map((t) => t.id));
    return logs.filter((l) => ids.has(l.task_id));
  }, [logs, filteredTasks, category]);

  const streak = longestCurrentStreak(dailies);
  const pct = todayCompletionPercent(dailies);
  const total = totalCompletions(relevantLogs);
  const rate = successRate(dailies, relevantLogs, 14);
  const motivation = pickMotivation(MOTIVATIONAL_MESSAGES, streak);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareStatsCard({
        level: player.level,
        streak,
        rate,
        avatarIcon: player.avatarIcon,
        avatarColor: player.avatarColor,
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('all')}
          className={`flex-none rounded-full px-3 py-1.5 text-xs font-medium border transition ${
            category === 'all' ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-parchment-dim'
          }`}
        >
          Tout
        </button>
        {GOALS.map((g) => (
          <button
            key={g.key}
            onClick={() => setCategory(g.key)}
            className={`flex-none rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              category === g.key ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-parchment-dim'
            }`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-gold/30 rounded-xl px-4 py-3 text-center">
        <p className="text-sm text-gold font-medium">{motivation}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Meilleure série" value={`${streak} j`} />
        <StatCard label="Aujourd'hui" value={`${pct}%`} />
        <StatCard label="Total accompli" value={total} />
        <StatCard label="Réussite (14 j)" value={`${rate}%`} />
      </div>

      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full rounded-lg bg-gold/10 border border-gold/40 text-gold text-sm font-semibold py-2.5 disabled:opacity-50"
      >
        {sharing ? 'Génération…' : '📤 Partager ma série'}
      </button>

      <div>
        <h3 className="font-display text-sm tracking-wider text-gold uppercase mb-2.5">
          Calendriers
        </h3>
        {trackables.length === 0 ? (
          <p className="text-xs text-parchment-dim italic">
            Aucune habitude ou quotidienne dans cette catégorie pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {trackables.map((t) => (
              <HabitCalendar key={t.id} task={t} logs={logs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-hairline rounded-xl px-3 py-3 text-center">
      <p className="font-mono-num text-xl font-bold text-parchment">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-parchment-dim mt-0.5">{label}</p>
    </div>
  );
}
