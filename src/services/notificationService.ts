export function scheduleInAppReminder(onFire: () => void, ms = 10000) {
  return setTimeout(onFire, ms);
}
