declare module 'expo-sqlite' {
  export function openDatabaseSync(name: string): {
    execAsync?: (sql: string) => Promise<void>;
    getAllAsync?: (sql: string, params?: unknown[]) => Promise<unknown[]>;
    runAsync?: (sql: string, params?: unknown[]) => Promise<void>;
  };
}
