const memory = new Map<string, string>();

export async function getItem(key: string): Promise<string | null> {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memory.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
    return;
  }
  memory.set(key, value);
}
