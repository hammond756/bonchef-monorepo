import { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/utils/supabase/client";
import { useSuccessOverlay } from "@/components/ui/success-overlay";
import { useTriggerJob } from "@/hooks/use-trigger-job";
import { API_URL } from "@/config/environment";
import TextArea from "../ui/textarea";
import { KeyboardController } from "react-native-keyboard-controller";

interface TextImportFormProps {
	onBack: () => void;
	onClose: () => void;
	initialText?: string;
}

export function TextImportForm({
	onBack,
	onClose,
	initialText,
}: TextImportFormProps) {
	const [text, setText] = useState(initialText || "");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { triggerSuccess, SuccessOverlayComponent } = useSuccessOverlay();
	const { triggerJobWithOfflineFallback } = useTriggerJob({
		supabaseClient: supabase,
		apiUrl: API_URL || "",
	});
	
	const handleTextSubmit = async () => {
		setError(null);
		setIsLoading(true);

		const textToSubmit = text.trim();
		if (!textToSubmit) {
			setError("Voer wat tekst in.");
			return;
		}

		try {
			await triggerJobWithOfflineFallback("text", textToSubmit);
			triggerSuccess(() => {
				setText("");
				onClose();
			});
		} catch {
			setError(
				"Er ging iets mis bij het importeren van het recept. Het is helaas niet duidelijk wat de oorzaak is.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		// We need to explicitly dismiss the keyboard to prevent the keyboard from staying open when the user presses the back button.
		// TODO: figure out if there is a better way to do this. Working theory is that the keyboard state is managed in the slide-in-overlay component.
		KeyboardController.dismiss();
		onBack();
	};

	return (
		<View className="p-6 flex-1">
			{/* Header */}
			<View className="flex-row items-center justify-between mb-6">
				<TouchableOpacity onPress={handleBack} className="p-2">
					<Ionicons name="arrow-back" size={24} color="#6B7280" />
				</TouchableOpacity>
				<Text className="text-xl font-semibold font-lora text-gray-900">
					Importeer van Notitie
				</Text>
				<TouchableOpacity onPress={onClose} className="p-2">
					<Ionicons name="close" size={24} color="#6B7280" />
				</TouchableOpacity>
			</View>

			<View>
				{/* Description */}
				<Text className="text-gray-600 mb-6">
					Plak de tekst van het recept dat je wilt importeren.
				</Text>

				{/* Text Input */}
				<TextArea
					placeholder="Plak of schrijf hier je recept..."
					value={text}
					minHeight={120}
					maxHeight={200}
					onChangeText={(text) => {
						setText(text);
						setError(null);
					}}
					onBlur={() => {
						KeyboardController.dismiss();
					}}
					error={error || undefined}
				/>

				{/* Submit Button */}
				<TouchableOpacity
					onPress={handleTextSubmit}
					disabled={isLoading}
					className={`rounded-xl py-4 px-6 ${
						isLoading ? "bg-gray-300" : "bg-green-600"
					}`}
				>
					<Text className="text-white text-center font-medium text-base">
						{isLoading ? "Importeren..." : "Importeren"}
					</Text>
				</TouchableOpacity>
			</View>

			<SuccessOverlayComponent />
		</View>
	);
}
