import { MMKV, Mode } from "react-native-mmkv";

export const storage = new MMKV({
    id: 'bonchef_shared_storage',
    mode: Mode.MULTI_PROCESS,
});


// Adapter to use MMKV with Supabase, which AsyncStorage from react-native-async-storage
export const AsyncStorage = {
    setItem: (key: string, value: string) => {
        storage.set(key, value);
        return Promise.resolve();
    },
    getItem: (key: string) => {
        const value = storage.getString(key);
        return Promise.resolve(value ?? null);
    },
    removeItem: (key: string) => {
        storage.delete(key);
        return Promise.resolve();
    },
};