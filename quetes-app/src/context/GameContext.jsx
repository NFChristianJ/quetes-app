import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  applyTaskReward,
  applyHabitDamage,
  applyReward,
  runDailyCron,
  todayKey,
} from '../lib/gameLogic';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = 'info') => {
    setToast({ message, kind, id: Date.now() });
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p, error: pErr }, { data: t, error: tErr }] = await Promise.all([
      supabase.from('player_stats').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at'),
    ]);

    if (pErr || tErr) {
      notify("Impossible de charger tes données. Vérifie ta connexion.", 'error');
      setLoading(false);
      return;
    }

    let playerRow = p;
    if (!playerRow) {
      const { data: created } = await supabase
        .from('player_stats')
        .insert({ user_id: user.id })
        .select()
        .single();
      playerRow = created;
    }

    const normalizedPlayer = {
      level: playerRow.level,
      xp: playerRow.xp,
      gold: playerRow.gold,
      hp: playerRow.hp,
      maxHp: playerRow.max_hp,
    };
    const loadedTasks = (t || []).map(mapTaskFromDb);

    // Cron quotidien : dégâts pour les quotidiennes manquées depuis la dernière ouverture
    const dailies = loadedTasks.filter((tk) => tk.type === 'daily');
    const cron = runDailyCron(normalizedPlayer, dailies, playerRow.last_cron);

    if (cron.summary) {
      await supabase
        .from('player_stats')
        .update({
          level: cron.player.level,
          xp: cron.player.xp,
          gold: cron.player.gold,
          hp: cron.player.hp,
          max_hp: cron.player.maxHp,
          last_cron: cron.newCronDate,
        })
        .eq('user_id', user.id);

      for (const reset of cron.resetTaskIds) {
        await supabase
          .from('tasks')
          .update({ completed: false, streak: reset.streak })
          .eq('id', reset.id);
      }

      if (cron.summary.totalDamage > 0) {
        loadedTasks.forEach((tk) => {
          if (tk.type === 'daily') {
            tk.completed = false;
            const r = cron.resetTaskIds.find((x) => x.id === tk.id);
            if (r) tk.streak = r.streak;
          }
        });
        notify(
          cron.summary.defeated
            ? `Vaincu(e) ! ${cron.summary.totalDamage} PV perdus sur ${cron.summary.missedDays} jour(s) manqué(s). Ton or a été divisé par deux.`
            : `${cron.summary.totalDamage} PV perdus pour des quotidiennes manquées (${cron.summary.missedDays} j).`,
          'warning'
        );
      }
    }

    setPlayer(cron.player);
    setTasks(loadedTasks);
    setLoading(false);
  }, [user, notify]);

  useEffect(() => {
    if (user) loadAll();
    else {
      setPlayer(null);
      setTasks([]);
    }
  }, [user, loadAll]);

  const syncPlayer = useCallback(
    async (nextPlayer) => {
      setPlayer(nextPlayer);
      await supabase
        .from('player_stats')
        .update({
          level: nextPlayer.level,
          xp: nextPlayer.xp,
          gold: nextPlayer.gold,
          hp: nextPlayer.hp,
          max_hp: nextPlayer.maxHp,
        })
        .eq('user_id', user.id);
    },
    [user]
  );

  const addTask = useCallback(
    async (task) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, ...mapTaskToDb(task) })
        .select()
        .single();
      if (error) {
        notify("La création de la tâche a échoué.", 'error');
        return;
      }
      setTasks((prev) => [...prev, mapTaskFromDb(data)]);
    },
    [user, notify]
  );

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  }, []);

  const completeTaskInDb = async (id, patch) => {
    await supabase.from('tasks').update(patch).eq('id', id);
  };

  const scoreHabit = useCallback(
    async (task, direction) => {
      if (direction === 'up') {
        const next = applyTaskReward(player, task.difficulty);
        await syncPlayer(next);
        if (next.leveledUp) notify(`Niveau ${next.level} atteint !`, 'success');
        else notify('+XP  +Or', 'success');
      } else {
        const next = applyHabitDamage(player, task.difficulty);
        await syncPlayer(next);
        notify(`-${next.lastDamage} PV`, 'danger');
      }
    },
    [player, syncPlayer, notify]
  );

  const toggleDaily = useCallback(
    async (task) => {
      const nowCompleted = !task.completed;
      const streak = nowCompleted ? task.streak + 1 : Math.max(0, task.streak - 1);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: nowCompleted, streak } : t))
      );
      await completeTaskInDb(task.id, { completed: nowCompleted, streak });

      if (nowCompleted) {
        const next = applyTaskReward(player, task.difficulty);
        await syncPlayer(next);
        if (next.leveledUp) notify(`Niveau ${next.level} atteint !`, 'success');
      } else {
        const next = applyHabitDamage(player, task.difficulty);
        await syncPlayer(next);
      }
    },
    [player, syncPlayer, notify]
  );

  const completeTodo = useCallback(
    async (task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await completeTaskInDb(task.id, { completed: true, active: false });
      const next = applyTaskReward(player, task.difficulty);
      await syncPlayer(next);
      notify(next.leveledUp ? `Niveau ${next.level} atteint !` : 'Quête accomplie', 'success');
    },
    [player, syncPlayer, notify]
  );

  const buyReward = useCallback(
    async (task) => {
      if (player.gold < task.cost) {
        notify("Pas assez d'or.", 'warning');
        return;
      }
      const next = applyReward(player, task.cost);
      await syncPlayer(next);
      notify(`"${task.title}" débloqué`, 'success');
    },
    [player, syncPlayer, notify]
  );

  const value = {
    player,
    tasks,
    loading,
    toast,
    dismissToast: () => setToast(null),
    addTask,
    deleteTask,
    scoreHabit,
    toggleDaily,
    completeTodo,
    buyReward,
    refresh: loadAll,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}

function mapTaskFromDb(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    notes: row.notes,
    difficulty: row.difficulty,
    positive: row.positive,
    negative: row.negative,
    completed: row.completed,
    streak: row.streak,
    active: row.active,
    dueDate: row.due_date,
    cost: row.cost,
  };
}

function mapTaskToDb(task) {
  return {
    type: task.type,
    title: task.title,
    notes: task.notes || '',
    difficulty: task.difficulty || 'facile',
    positive: task.positive ?? true,
    negative: task.negative ?? false,
    completed: false,
    streak: 0,
    active: true,
    due_date: task.dueDate || null,
    cost: task.cost ?? null,
  };
}

export { todayKey };
