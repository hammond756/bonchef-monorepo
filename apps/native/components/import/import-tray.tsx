import { Dimensions, View } from "react-native";
import { useState } from "react";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";
import { ImportOptions } from "./import-options";
import { UrlImportForm } from "./url-import-form";
import { TextImportForm } from "./text-import-form";
import { SlideInOverlay } from "./slide-in-overlay";

interface ImportTrayProps {
	isOpen: boolean;
	onClose: () => void;
}

type ImportStep = "options" | "url" | "text";

export function ImportTray({ isOpen, onClose }: ImportTrayProps) {
	const translateX = useSharedValue(0);
	const springConfig = { stiffness: 100, mass: 1, damping: 100 };
	const [activeForm, setActiveForm] = useState<"url" | "text" | null>(null);

	const handleStepChange = (step: ImportStep) => {
		if (step === "options") {
			translateX.value = withSpring(0, springConfig);
			setActiveForm(null);
		} else {
			translateX.value = withSpring(
				-Dimensions.get("window").width,
				springConfig,
			);
			setActiveForm(step);
		}
	};

	const handleBack = () => {
		if (activeForm) {
			// If we're in a form, go back to options
			setActiveForm(null);
			translateX.value = withSpring(0, springConfig);
		} else {
			handleStepChange("options");
		}
	};

	const handleClose = () => {
		// Reset to options step
		translateX.value = withSpring(0, springConfig);
		setActiveForm(null);
		onClose();
	};

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	return (
		<SlideInOverlay isOpen={isOpen} onClose={handleClose}>
			<View className="flex-1">
				<Animated.View
					style={[
						animatedStyle,
						{
							flexDirection: "row",
							width: Dimensions.get("window").width * 2, // 3 steps total
							flex: 1,
						},
					]}
				>
					{/* Options step */}
					<View
						style={{
							width: Dimensions.get("window").width,
							flex: 1,
						}}
					>
						<ImportOptions
							onSelectMode={(mode) => handleStepChange(mode as ImportStep)}
							onClose={handleClose}
						/>
					</View>

					{/* Forms step - URL and Text stacked */}
					<View
						style={{
							width: Dimensions.get("window").width,
							flex: 1,
							position: "relative",
						}}
					>
						{/* URL Form */}
						<View
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								opacity: activeForm === "url" ? 1 : 0,
								zIndex: activeForm === "url" ? 1 : 0,
							}}
						>
							<UrlImportForm onBack={handleBack} onClose={handleClose} />
						</View>

						{/* Text Form */}
						<View
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								opacity: activeForm === "text" ? 1 : 0,
								zIndex: activeForm === "text" ? 1 : 0,
							}}
						>
							<TextImportForm onBack={handleBack} onClose={handleClose} />
						</View>
					</View>
				</Animated.View>
			</View>
		</SlideInOverlay>
	);
}
