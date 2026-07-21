// Moteur de jeu : formules XP / Or / PV inspirées de Habitica, simplifiées.

export const DIFFICULTY = {
  trivial: { label: 'Trivial', mult: 0.5 },
  facile: { label: 'Facile', mult: 1 },
  moyen: { label: 'Moyen', mult: 1.5 },
  difficile: { label: 'Difficile', mult: 2 },
};

export const BASE_XP = 8;
export const BASE_GOLD = 4;
export const BASE_DAMAGE = 4;
export const START_MAX_HP = 50;
export const CRON_CAP_DAYS = 10; // on ne rattrape jamais plus de 10 jours de retard

export function xpToNextLevel(level) {
  return Math.round(95 + (level - 1) * 35);
}

export function maxHpForLevel(level) {
  return Math.min(START_MAX_HP + Math.floor(level / 2) * 2, 100);
}

export function applyTaskReward(player, difficultyKey) {
  const mult = DIFFICULTY[difficultyKey]?.mult ?? 1;
  let { level, xp, gold, hp, maxHp } = player;
  xp += Math.round(BASE_XP * mult);
  gold += Math.round(BASE_GOLD * mult);

  let leveledUp = false;
  let next = xpToNextLevel(level);
  while (xp >= next) {
    xp -= next;
    level += 1;
    leveledUp = true;
    maxHp = maxHpForLevel(level);
    hp = Math.min(maxHp, hp + 4);
    next = xpToNextLevel(level);
  }

  return { ...player, level, xp, gold, hp, maxHp, leveledUp };
}

export function applyHabitDamage(player, difficultyKey) {
  const mult = DIFFICULTY[difficultyKey]?.mult ?? 1;
  const reduction = Math.min(0.6, player.level * 0.015);
  const dmg = Math.max(1, Math.round(BASE_DAMAGE * mult * (1 - reduction)));
  const hp = Math.max(0, player.hp - dmg);
  return { ...player, hp, lastDamage: dmg };
}

export function applyReward(player, cost) {
  if (player.gold < cost) return player;
  return { ...player, gold: player.gold - cost };
}

// Retourne YYYY-MM-DD en heure locale (pas UTC, pour coller au fuseau de l'utilisateur)
export function todayKey() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export function daysBetween(dateKeyA, dateKeyB) {
  const a = new Date(dateKeyA + 'T00:00:00');
  const b = new Date(dateKeyB + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

/**
 * "Cron" quotidien façon Habitica : à exécuter une fois par jour, au premier
 * chargement de l'app. Pour chaque quotidienne non cochée depuis lastCron,
 * inflige des dégâts et remet son statut à zéro. Renvoie le joueur mis à jour
 * + la liste des quotidiennes à réinitialiser + un résumé pour l'utilisateur.
 */
export function runDailyCron(player, dailies, lastCron) {
  const today = todayKey();
  if (lastCron === today) {
    return { player, resetTaskIds: [], summary: null };
  }

  const missedDays = Math.min(
    CRON_CAP_DAYS,
    Math.max(1, daysBetween(lastCron || today, today))
  );

  let updatedPlayer = { ...player };
  const resetTaskIds = [];
  let totalDamage = 0;
  let brokenStreaks = 0;

  for (const daily of dailies) {
    if (!daily.active) continue;
    if (!daily.completed) {
      const before = updatedPlayer.hp;
      for (let i = 0; i < missedDays; i++) {
        updatedPlayer = applyHabitDamage(updatedPlayer, daily.difficulty);
      }
      totalDamage += before - updatedPlayer.hp;
      if (daily.streak > 0) brokenStreaks += 1;
      resetTaskIds.push({ id: daily.id, streak: 0 });
    } else {
      resetTaskIds.push({ id: daily.id, streak: daily.streak });
    }
  }

  let defeated = false;
  if (updatedPlayer.hp <= 0) {
    defeated = true;
    updatedPlayer.hp = Math.max(1, Math.floor(updatedPlayer.maxHp * 0.5));
    updatedPlayer.gold = Math.floor(updatedPlayer.gold * 0.5);
  }

  return {
    player: updatedPlayer,
    resetTaskIds,
    summary: { missedDays, totalDamage, brokenStreaks, defeated },
    newCronDate: today,
  };
}
