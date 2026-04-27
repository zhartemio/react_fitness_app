export async function hasInternetConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }

  try {
    await fetch('https://www.google.com/favicon.ico', { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}
