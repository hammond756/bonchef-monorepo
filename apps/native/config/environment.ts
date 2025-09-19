import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isAndroidSimulator = Platform.OS === 'android' && Constants.deviceName?.includes('sdk');

console.log("isAndroidSimulator", isAndroidSimulator);
console.log("platform", Platform.OS);
console.log("deviceName", Constants.deviceName);

// Re-export because android simulator has localhost at 10.0.2.2
export const SUPABASE_URL = isAndroidSimulator ? process.env.EXPO_PUBLIC_ANDROID_SIMULATOR_SUPABASE_URL : process.env.EXPO_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
export const API_URL = isAndroidSimulator ? process.env.EXPO_PUBLIC_ANDROID_SIMULATOR_API_URL : process.env.EXPO_PUBLIC_API_URL