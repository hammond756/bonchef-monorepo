import { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/utils/supabase/client";
import { useSuccessOverlay } from "@/components/ui/success-overlay";
import { triggerJob } from "@repo/lib/services/recipe-import-jobs";
import { API_URL } from "@/config/environment";
import TextArea from "../ui/textarea";

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

	const handleTextSubmit = async () => {
		setError(null);
		setIsLoading(true);

		const textToSubmit = text.trim();
		if (!textToSubmit) {
			setError("Voer wat tekst in.");
			return;
		}

		try {
			await triggerJob(supabase, API_URL || "", "text", textToSubmit);
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

	return (
		<View className="p-6 flex-1">
			{/* Header */}
			<View className="flex-row items-center justify-between mb-6">
				<TouchableOpacity onPress={onBack} className="p-2">
					<Ionicons name="arrow-back" size={24} color="#6B7280" />
				</TouchableOpacity>
				<Text className="text-xl font-semibold text-gray-900">
					Importeer van Tekst
				</Text>
				<TouchableOpacity onPress={onClose} className="p-2">
					<Ionicons name="close" size={24} color="#6B7280" />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
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
			</ScrollView>

			<SuccessOverlayComponent />
		</View>
	);
}
