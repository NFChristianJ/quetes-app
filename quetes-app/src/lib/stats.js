import { todayKey } from './gameLogic';

export function lastNDates(n) {
  const dates = [];
  const today = new Date(todayKey() + 'T00:00:00');
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Pour une tâche donnée : tableau { date, done } sur les N derniers jours.
export function heatmapForTask(taskId, logs, days = 84) {
  const dates = lastNDates(days);
  const byDate = new Map(
    logs.filter((l) => l.task_id === taskId).map((l) => [l.log_date, l.done])
  );
  return dates.map((date) => ({ date, done: byDate.get(date) === true }));
}

export function longestCurrentStreak(dailies) {
  if (!dailies.length) return 0;
  return Math.max(0, ...dailies.map((t) => t.streak || 0));
}

export function todayCompletionPercent(dailies) {
  if (!dailies.length) return 0;
  const done = dailies.filter((t) => t.completed).length;
  return Math.round((done / dailies.length) * 100);
}

export function totalCompletions(logs) {
  return logs.filter((l) => l.done).length;
}

// Taux de réussite moyen sur les N derniers jours (toutes quotidiennes/habitudes confondues)
export function successRate(dailies, logs, days = 14) {
  if (!dailies.length) return 0;
  const dates = lastNDates(days);
  const doneSet = new Set(
    logs.filter((l) => l.done).map((l) => `${l.task_id}_${l.log_date}`)
  );
  let scored = 0;
  let total = 0;
  for (const date of dates) {
    for (const task of dailies) {
      total += 1;
      if (doneSet.has(`${task.id}_${date}`)) scored += 1;
    }
  }
  return total === 0 ? 0 : Math.round((scored / total) * 100);
}

export function pickMotivation(messages, streak) {
  if (streak >= 21) return messages[3];
  if (streak >= 7) return messages[0];
  if (streak === 0) return messages[4];
  return messages[Math.floor(Math.random() * messages.length)];
}
