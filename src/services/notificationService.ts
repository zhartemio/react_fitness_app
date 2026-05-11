import { getItem, setItem } from '@/src/storage/localStore';

const REMINDERS_KEY = 'scheduled_in_app_reminders';
const MAX_TIMEOUT_MS = 2_147_483_647;

export interface ScheduledReminder {
  id: string;
  text: string;
  scheduledAt: string;
}

type TimeoutHandle = ReturnType<typeof setTimeout>;

const activeTimers = new Map<string, TimeoutHandle>();

function getDelayUntil(scheduledAt: string) {
  const targetTime = new Date(scheduledAt).getTime();

  if (Number.isNaN(targetTime)) {
    return null;
  }

  return targetTime - Date.now();
}

function setLongTimeout(onFire: () => void, delayMs: number): TimeoutHandle {
  return setTimeout(() => {
    if (delayMs > MAX_TIMEOUT_MS) {
      setLongTimeout(onFire, delayMs - MAX_TIMEOUT_MS);
      return;
    }

    onFire();
  }, Math.min(delayMs, MAX_TIMEOUT_MS));
}

async function readReminders(): Promise<ScheduledReminder[]> {
  const raw = await getItem(REMINDERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeReminders(reminders: ScheduledReminder[]) {
  await setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function scheduleInAppReminder(onFire: () => void, ms = 10000) {
  return setTimeout(onFire, ms);
}

export async function saveScheduledReminder(reminder: ScheduledReminder) {
  const reminders = await readReminders();
  const nextReminders = reminders.filter((item) => item.id !== reminder.id);

  nextReminders.push(reminder);
  await writeReminders(nextReminders);
}

export async function removeScheduledReminder(id: string) {
  const timer = activeTimers.get(id);

  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(id);
  }

  const reminders = await readReminders();
  await writeReminders(reminders.filter((item) => item.id !== id));
}

export async function scheduleReminderAt(reminder: ScheduledReminder, onFire: (reminder: ScheduledReminder) => void) {
  const delayMs = getDelayUntil(reminder.scheduledAt);

  if (delayMs === null || delayMs <= 0) {
    return false;
  }

  await saveScheduledReminder(reminder);

  const existingTimer = activeTimers.get(reminder.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setLongTimeout(async () => {
    activeTimers.delete(reminder.id);
    await removeScheduledReminder(reminder.id);
    onFire(reminder);
  }, delayMs);

  activeTimers.set(reminder.id, timer);
  return true;
}

export async function restoreScheduledReminders(onFire: (reminder: ScheduledReminder) => void) {
  const reminders = await readReminders();
  const futureReminders = reminders.filter((reminder) => {
    const delayMs = getDelayUntil(reminder.scheduledAt);
    return delayMs !== null && delayMs > 0;
  });

  if (futureReminders.length !== reminders.length) {
    await writeReminders(futureReminders);
  }

  await Promise.all(futureReminders.map((reminder) => scheduleReminderAt(reminder, onFire)));
}
