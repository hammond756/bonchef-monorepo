import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button, Divider } from "@/components/ui";
import GoogleSignInButton from "@/components/google-sign-in-button";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Signup() {
	const router = useRouter();

	const handleGoogleSignUpSuccess = () => {
		router.push("/discover");
	};

	const handleGoogleSignUpError = (error: Error) => {
		Alert.alert("Error", error.message || "Failed to sign up with Google");
	};

	const handleLoginPress = () => {
		router.push("/");
	};

	const handleEmailSignupPress = () => {
		router.push("/signup-email");
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
						Maak <Text className="font-bold text-green-600">gratis</Text> een account aan om te beginnen met recepten verzamelen.
					</Text>
				</View>

				{/* Google Signup Button */}
				<GoogleSignInButton
					onSuccess={handleGoogleSignUpSuccess}
					onError={handleGoogleSignUpError}
					className="mb-6"
					text="Aanmelden met Google"
				/>

				{/* Separator */}
				<Divider />

				{/* Email Signup Button */}
				<Button
					title="Aanmelden met email-adres"
					onPress={handleEmailSignupPress}
					className="mb-6"
					variant="secondary"
				/>

				{/* Login Link */}
				<TouchableOpacity onPress={handleLoginPress} className="items-center">
					<Text className="text-base text-gray-600">
						Heb je al een account?{" "}
						<Text className="underline text-green-700">Log dan hier in</Text>
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
}
