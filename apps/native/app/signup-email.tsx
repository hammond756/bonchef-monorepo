import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button, Input } from "@/components/ui";
import * as authService from "@repo/lib/services/auth";
import { supabase } from "@/lib/utils/supabase/client";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function SignupEmail() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function signUpWithEmail() {
		if (password !== confirmPassword) {
			Alert.alert("Error", "Wachtwoorden komen niet overeen");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Wachtwoord moet minimaal 6 karakters bevatten");
			return;
		}

		setLoading(true);
		try {
			await authService.signup(supabase, email, password);
			Alert.alert("Success", "Account succesvol aangemaakt!");
			router.push("/");
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : "Failed to create account",
			);
		}
		setLoading(false);
	}

	const handleBackPress = () => {
		router.back();
	};

	return (
		<KeyboardAwareScrollView
			bottomOffset={63}
			className="flex-1"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<View className="flex-1 flex-col bg-white px-6 py-10 justify-center">
				{/* Header Section */}
				<View className="mb-8">
					<Text className="text-3xl font-bold text-gray-800 mb-4 text-center">
						Account aanmaken
					</Text>
					<Text className="text-base text-gray-600 text-center">
						Vul je gegevens in om een account aan te maken
					</Text>
				</View>

				{/* Email Input */}
				<Input
					label="Email"
					placeholder="name@example.com"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				{/* Username Input */}
				<Input
					label="Gebruikersnaam"
					placeholder="John Doe"
					value={username}
					onChangeText={setUsername}
					helperText="De naam waaronder je publieke recepten zichtbaar zijn"
				/>

				{/* Password Input */}
				<Input
					label="Wachtwoord"
					placeholder="••••••••"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={true}
				/>

				{/* Confirm Password Input */}
				<Input
					label="Bevestig wachtwoord"
					placeholder="••••••••"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry={true}
				/>

				{/* Signup Button */}
				<Button
					title="Account aanmaken"
					onPress={signUpWithEmail}
					disabled={loading}
					className="mt-2 mb-6"
				/>

				{/* Back Link */}
				<TouchableOpacity onPress={handleBackPress} className="items-center">
					<Text className="text-base text-gray-600">
						<Text className="underline text-green-700">Terug naar aanmeldopties</Text>
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
}
