import { AppState } from "react-native";
import { AsyncStorage } from "@/lib/utils/mmkv/storage";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/environment";

const supabaseUrl = SUPABASE_URL as string;
const supabaseAnonKey = SUPABASE_ANON_KEY as string;

console.log("supabaseUrl", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
        storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		console.log("Starting auto refresh");
		supabase.auth.startAutoRefresh();
	} else {
		console.log("Stopping auto refresh");
		supabase.auth.stopAutoRefresh();
	}
});