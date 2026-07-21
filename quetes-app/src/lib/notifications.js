import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Transforme un UUID de tâche en un entier stable (requis par l'API de notifs)
function taskIdToNotifId(taskId) {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = (hash * 31 + taskId.charCodeAt(i)) >>> 0;
  }
  return hash % 2147483647;
}

export async function ensureNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  const status = await LocalNotifications.checkPermissions();
  if (status.display === 'granted') return true;
  const req = await LocalNotifications.requestPermissions();
  return req.display === 'granted';
}

export async function scheduleReminder(task) {
  if (!Capacitor.isNativePlatform()) return;
  if (task.type !== 'daily' || !task.reminderTime) return;
  const [hour, minute] = task.reminderTime.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;

  const id = taskIdToNotifId(task.id);
  await LocalNotifications.cancel({ notifications: [{ id }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: 'Quêtes',
        body: `Rappel : ${task.title}`,
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
      },
    ],
  });
}

export async function cancelReminder(taskId) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: taskIdToNotifId(taskId) }] });
}
