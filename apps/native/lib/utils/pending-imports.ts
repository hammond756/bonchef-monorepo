export interface PendingImport {
  id: string;
  type: 'url' | 'text';
  data: string;
  timestamp: number;
}

import { storage } from './mmkv/storage';

const PENDING_IMPORTS_KEY = 'bonchef_pending_imports_v1';

export const pendingImportsStorage = {
  add: (importData: Omit<PendingImport, 'id' | 'timestamp'>): void => {
    const pendingImports = pendingImportsStorage.getAll();
    const newImport: PendingImport = {
      ...importData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const updatedImports = [...pendingImports, newImport];
    storage.set(PENDING_IMPORTS_KEY, JSON.stringify(updatedImports));
  },

  getAll: (): PendingImport[] => {
    const stored = storage.getString(PENDING_IMPORTS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing pending imports:', error);
      return [];
    }
  },

  clear: (): void => {
    storage.delete(PENDING_IMPORTS_KEY);
  },

  remove: (id: string): void => {
    const pendingImports = pendingImportsStorage.getAll();
    const updatedImports = pendingImports.filter(imp => imp.id !== id);
    storage.set(PENDING_IMPORTS_KEY, JSON.stringify(updatedImports));
  },
};
