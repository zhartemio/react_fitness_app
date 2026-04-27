import { User } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const USERS_KEY = 'users_local';
const CURRENT_KEY = 'current_user';

interface AuthUser {
  id: string;
  email: string;
  password: string;
}

async function getUsers(): Promise<AuthUser[]> {
  const raw = await getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as AuthUser[]) : [];
}

export async function register(email: string, password: string): Promise<User> {
  const users = await getUsers();
  const user = { id: Date.now().toString(), email, password };
  await setItem(USERS_KEY, JSON.stringify([user, ...users]));
  await setItem(CURRENT_KEY, JSON.stringify(user));
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string): Promise<User | null> {
  const users = await getUsers();
  const found = users.find((u) => u.email === email && u.password === password);
  if (!found) return null;
  await setItem(CURRENT_KEY, JSON.stringify(found));
  return { id: found.id, email: found.email };
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await getItem(CURRENT_KEY);
  if (!raw) return null;
  const user = JSON.parse(raw) as AuthUser;
  return { id: user.id, email: user.email };
}
