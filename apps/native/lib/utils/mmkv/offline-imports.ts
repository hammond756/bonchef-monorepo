import { RecipeImportSourceType } from '@repo/lib/services/recipe-import-jobs';
import { storage } from './storage';

export interface OfflineImport {
  id: string;
  type: RecipeImportSourceType;
  data: string;
  timestamp: number;
}

const OFFLINE_IMPORTS_KEY = 'bonchef_offline_imports_v1';

export const offlineImportsStorage = {
  add: (importData: Omit<OfflineImport, 'id' | 'timestamp'>): void => {
    const offlineImports = offlineImportsStorage.getAll();
    const newImport: OfflineImport = {
      ...importData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const updatedImports = [...offlineImports, newImport];
    storage.set(OFFLINE_IMPORTS_KEY, JSON.stringify(updatedImports));
  },

  getAll: (): OfflineImport[] => {
    const stored = storage.getString(OFFLINE_IMPORTS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing offline imports:', error);
      return [];
    }
  },

  clear: (): void => {
    storage.delete(OFFLINE_IMPORTS_KEY);
  },

  remove: (id: string): void => {
    const offlineImports = offlineImportsStorage.getAll();
    const updatedImports = offlineImports.filter(imp => imp.id !== id);
    storage.set(OFFLINE_IMPORTS_KEY, JSON.stringify(updatedImports));
  },
};
