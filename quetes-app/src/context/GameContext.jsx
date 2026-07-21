import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { applyTheme } from '../lib/themes';
import { ensureNotificationPermission, scheduleReminder, cancelReminder } from '../lib/notifications';
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
  const [logs, setLogs] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = 'info') => {
    setToast({ message, kind, id: Date.now() });
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p, error: pErr }, { data: t, error: tErr }, { data: l }, { data: r }] =
      await Promise.all([
        supabase.from('player_stats').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at'),
        supabase
          .from('task_logs')
          .select('task_id, log_date, done')
          .eq('user_id', user.id)
          .gte('log_date', new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10)),
        supabase.from('rituals').select('*').eq('user_id', user.id).order('created_at'),
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

    const normalizedPlayer = mapPlayerFromDb(playerRow);
    applyTheme(normalizedPlayer.theme);
    const loadedTasks = (t || []).map(mapTaskFromDb);

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
    setLogs(l || []);
    setRituals((r || []).map(mapRitualFromDb));
    setLoading(false);

    ensureNotificationPermission().then((granted) => {
      if (granted) loadedTasks.filter((tk) => tk.type === 'daily').forEach(scheduleReminder);
    });
  }, [user, notify]);

  useEffect(() => {
    if (user) loadAll();
    else {
      setPlayer(null);
      setTasks([]);
      setLogs([]);
      setRituals([]);
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

  const updateProfile = useCallback(
    async (patch) => {
      setPlayer((prev) => ({ ...prev, ...patch }));
      const dbPatch = {};
      if (patch.goals !== undefined) dbPatch.goals = patch.goals;
      if (patch.onboarded !== undefined) dbPatch.onboarded = patch.onboarded;
      if (patch.theme !== undefined) {
        dbPatch.theme = patch.theme;
        applyTheme(patch.theme);
      }
      if (patch.avatarIcon !== undefined) dbPatch.avatar_icon = patch.avatarIcon;
      if (patch.avatarColor !== undefined) dbPatch.avatar_color = patch.avatarColor;
      await supabase.from('player_stats').update(dbPatch).eq('user_id', user.id);
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
        return null;
      }
      const mapped = mapTaskFromDb(data);
      setTasks((prev) => [...prev, mapped]);
      scheduleReminder(mapped);
      return mapped;
    },
    [user, notify]
  );

  const addTasksBulk = useCallback(
    async (taskList) => {
      const rows = taskList.map((t) => ({ user_id: user.id, ...mapTaskToDb(t) }));
      const { data, error } = await supabase.from('tasks').insert(rows).select();
      if (error) {
        notify("L'ajout a échoué.", 'error');
        return;
      }
      const mapped = data.map(mapTaskFromDb);
      setTasks((prev) => [...prev, ...mapped]);
      mapped.forEach(scheduleReminder);
      notify(`${data.length} tâche(s) ajoutée(s)`, 'success');
    },
    [user, notify]
  );

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await cancelReminder(id);
    await supabase.from('tasks').delete().eq('id', id);
  }, []);

  const updateTaskFields = useCallback(async (task, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    const dbPatch = {};
    if (patch.checklist !== undefined) dbPatch.checklist = patch.checklist;
    if (patch.reminderTime !== undefined) dbPatch.reminder_time = patch.reminderTime;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    await supabase.from('tasks').update(dbPatch).eq('id', task.id);
    if (patch.reminderTime !== undefined) scheduleReminder({ ...task, ...patch });
  }, []);

  const toggleChecklistItem = useCallback(
    (task, itemIndex) => {
      const checklist = task.checklist.map((item, i) =>
        i === itemIndex ? { ...item, done: !item.done } : item
      );
      updateTaskFields(task, { checklist });
    },
    [updateTaskFields]
  );

  const logTask = useCallback(
    async (taskId, done) => {
      const today = todayKey();
      if (done) {
        await supabase
          .from('task_logs')
          .upsert(
            { user_id: user.id, task_id: taskId, log_date: today, done: true },
            { onConflict: 'task_id,log_date' }
          );
        setLogs((prev) => [
          ...prev.filter((l) => !(l.task_id === taskId && l.log_date === today)),
          { task_id: taskId, log_date: today, done: true },
        ]);
      } else {
        await supabase.from('task_logs').delete().eq('task_id', taskId).eq('log_date', today);
        setLogs((prev) => prev.filter((l) => !(l.task_id === taskId && l.log_date === today)));
      }
    },
    [user]
  );

  const scoreHabit = useCallback(
    async (task, direction) => {
      if (direction === 'up') {
        const next = applyTaskReward(player, task.difficulty);
        await syncPlayer(next);
        await logTask(task.id, true);
        if (next.leveledUp) notify(`Niveau ${next.level} atteint !`, 'success');
        else notify('+XP  +Or', 'success');
      } else {
        const next = applyHabitDamage(player, task.difficulty);
        await syncPlayer(next);
        await logTask(task.id, false);
        notify(`-${next.lastDamage} PV`, 'danger');
      }
    },
    [player, syncPlayer, logTask, notify]
  );

  const toggleDaily = useCallback(
    async (task) => {
      const nowCompleted = !task.completed;
      const streak = nowCompleted ? task.streak + 1 : Math.max(0, task.streak - 1);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: nowCompleted, streak } : t))
      );
      await supabase.from('tasks').update({ completed: nowCompleted, streak }).eq('id', task.id);
      await logTask(task.id, nowCompleted);

      if (nowCompleted) {
        const next = applyTaskReward(player, task.difficulty);
        await syncPlayer(next);
        if (next.leveledUp) notify(`Niveau ${next.level} atteint !`, 'success');
      } else {
        const next = applyHabitDamage(player, task.difficulty);
        await syncPlayer(next);
      }
    },
    [player, syncPlayer, logTask, notify]
  );

  const completeTodo = useCallback(
    async (task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await supabase.from('tasks').update({ completed: true, active: false }).eq('id', task.id);
      await logTask(task.id, true);
      const next = applyTaskReward(player, task.difficulty);
      await syncPlayer(next);
      notify(next.leveledUp ? `Niveau ${next.level} atteint !` : 'Quête accomplie', 'success');
    },
    [player, syncPlayer, logTask, notify]
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

  const createRitual = useCallback(
    async (ritual) => {
      const { data, error } = await supabase
        .from('rituals')
        .insert({
          user_id: user.id,
          title: ritual.title,
          moment: ritual.moment || null,
          description: ritual.description || '',
          steps: ritual.steps,
        })
        .select()
        .single();
      if (error) {
        notify('La création du rituel a échoué.', 'error');
        return;
      }
      setRituals((prev) => [...prev, mapRitualFromDb(data)]);
      notify('Rituel créé', 'success');
    },
    [user, notify]
  );

  const deleteRitual = useCallback(async (id) => {
    setRituals((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('rituals').delete().eq('id', id);
  }, []);

  const applyRitual = useCallback(
    (ritual) => {
      addTasksBulk(
        ritual.steps.map((s) => ({
          type: 'daily',
          title: `${s.title} (${ritual.title})`,
          difficulty: s.difficulty,
          positive: true,
          negative: false,
        }))
      );
    },
    [addTasksBulk]
  );

  const value = {
    player,
    tasks,
    logs,
    rituals,
    loading,
    toast,
    dismissToast: () => setToast(null),
    addTask,
    addTasksBulk,
    deleteTask,
    updateTaskFields,
    toggleChecklistItem,
    scoreHabit,
    toggleDaily,
    completeTodo,
    buyReward,
    updateProfile,
    createRitual,
    deleteRitual,
    applyRitual,
    refresh: loadAll,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}

function mapPlayerFromDb(row) {
  return {
    level: row.level,
    xp: row.xp,
    gold: row.gold,
    hp: row.hp,
    maxHp: row.max_hp,
    goals: row.goals || [],
    onboarded: row.onboarded ?? false,
    theme: row.theme || 'arcane',
    avatarIcon: row.avatar_icon || '🧙',
    avatarColor: row.avatar_color || '#E3B54E',
  };
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
    checklist: row.checklist || [],
    category: row.category || null,
    reminderTime: row.reminder_time || null,
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
    checklist: task.checklist || [],
    category: task.category || null,
    reminder_time: task.reminderTime || null,
  };
}

function mapRitualFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    moment: row.moment,
    description: row.description,
    steps: row.steps || [],
    custom: true,
  };
}

export { todayKey };
